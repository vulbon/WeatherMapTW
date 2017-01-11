var xml2json = require("xml2js").parseString;
var async = require("async");
var request = require("request");

var Common = require("./Common");

var Weather = {};
// fcode => http://opendata.cwb.gov.tw/datalist

Weather["36h"] = function (query, outterCallback) {
    var fCode = "F-C0032-001";
    var url = genOpenDataRequestURL(fCode);
    async.waterfall([
        //get json object from xml
        function (callback) {
            callback(null, url);
        },
        xml2jsonFromURL,
        dataRearrange
    ], function (err, result) {
        outterCallback(err, result);
    });
}

Weather["1w"] = function (query, outterCallback) {
    if (query.county) {
        var county = query.county.replace("台", "臺");
        var fCode = getFCode(county + "未來1週天氣預報");
        var url = genOpenDataRequestURL(fCode);
        async.waterfall([
            //get json object from xml
            function (callback) {
                callback(null, url);
            },
            xml2jsonFromURL,
            dataRearrangeWithCounty
        ], function (err, result) {
            outterCallback(err, result);
        });
    } else {
        var url = genOpenDataRequestURL("F-C0032-005");
        async.waterfall([
            //get json object from xml
            function (callback) {
                callback(null, url);
            },
            xml2jsonFromURL,
            dataRearrange
        ], function (err, result) {
            outterCallback(err, result);
        });
    }
}


// 2d format is different then others
Weather["2d"] = function (query, outterCallback) {
    var url, fCode, county;
    if (query.county) {
        county = query.county.replace("台", "臺");
        fCode = getFCode(county + "未來2天天氣預報");
        url = genOpenDataRequestURL(fCode);
    } else {
        outterCallback({ "success": false, "message": "lack of parameter" })
    }
    async.waterfall([
        //get json object from xml
        function (callback) {
            callback(null, url);
        },
        xml2jsonFromURL,
        dataRearrangeWithCounty
    ], function (err, result) {
        outterCallback(err, result);
    });
}

function xml2jsonFromURL(url, callback) {
    Common.logWithDatetime("Get OpenData", url);
    request({
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36'
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //body = body.replace(/\n|\r?\n|\r|\s/g, '');
            xml2json(body, function (err, result) {
                if (err) {
                    Common.logWithDatetime("Error", url);
                    callback(err);
                } else {
                    Common.logWithDatetime("Got OpenData", url);
                    callback(null, url, result);
                }
            });
        }
    });
}

function dataRearrange(url, object, callback) {
    var dataset = object.cwbopendata.dataset[0];
    if (dataset) {
        var output = {};

        output.datasetInfo = JSON.parse(JSON.stringify(dataset.datasetInfo[0]).replace(/\n|\s|\[|\]/g, ''));
        output.datasetInfo.originalDataUrl = url;

        var data = {};
        for (var i = 0, ii = dataset.location.length; i < ii; i++) {
            var locationName = dataset.location[i].locationName[0].replace(/\n|\s/g, '');
            var wx = dataset.location[i].weatherElement;
            for (var j = 0, jj = wx.length; j < jj; j++) {
                var wxName = wx[j].elementName[0].replace(/\n|\s/g, '');
                var time = wx[j].time;
                for (var k = 0, kk = time.length; k < kk; k++) {
                    var dataTime = time[k].startTime[0].replace('T', ' ').split('+')[0].slice(0, -3)
                        + "~" +
                        time[k].endTime[0].replace('T', ' ').split('+')[0].slice(0, -3);

                    if (!data[wxName]) {
                        data[wxName] = {};
                    }
                    if (!data[wxName][dataTime]) {
                        data[wxName][dataTime] = {};
                    }
                    if (!data[wxName][dataTime][locationName]) {
                        data[wxName][dataTime][locationName] = {};
                    }

                    var parameter = {};
                    for (var key in time[k].parameter[0]) {
                        parameter[key] = time[k].parameter[0][key][0].replace(/\n|\s/g, '');
                    }
                    data[wxName][dataTime][locationName] = parameter;
                }
            }
        }
        // output.timeList = [];
        // for (var key in data) {
        //     output.timeList.push(key);
        // }
        output.data = data;
        callback(null, output);
    } else {
        callback({ "success": false, "message": "no data" });
    }
}

function dataRearrangeWithCounty(url, object, callback) {
    var dataset = object.cwbopendata.dataset[0];
    if (dataset) {
        var output = {};
        output.datasetInfo = JSON.parse(JSON.stringify(dataset.datasetInfo[0]).replace(/\\n|\s|\[|\]/g, ''));
        output.datasetInfo.originalDataUrl = url;
        var data = {};
        var locationInfo = {};

        var location = dataset.locations[0].location;
        for (var i = 0, ii = location.length; i < ii; i++) {
            var locationName = String(location[i].locationName).replace(/\n|\s/g, '');
            var lat = location[i].lat[0].replace(/\n|\s/g, '');
            var lon = location[i].lon[0].replace(/\n|\s/g, '');

            locationInfo[locationName] = { "lat": lat, "lon": lon };

            var wx = location[i].weatherElement;
            for (var j = 0, jj = wx.length; j < jj; j++) {
                var wxName = wx[j].elementName[0].replace(/\n|\s/g, '');
                var time = wx[j].time;

                for (var k = 0, kk = time.length; k < kk; k++) {
                    var dataTime = "";
                    if (time[k].dataTime) {
                        dataTime = time[k].dataTime[0].replace(/\\n|\s/g, '').replace('T', ' ').split('+')[0].slice(0, -3);
                    } else {
                        dataTime = time[k].startTime[0].replace(/\\n|\s/g, '').replace('T', ' ').split('+')[0].slice(0, -3)
                            + "~"
                            + time[k].endTime[0].replace(/\\n|\s/g, '').replace('T', ' ').split('+')[0].slice(0, -3);
                    }

                    if (!data[wxName]) {
                        data[wxName] = {};
                    }
                    if (!data[wxName][dataTime]) {
                        data[wxName][dataTime] = {};
                    }
                    if (!data[wxName][dataTime][locationName]) {
                        data[wxName][dataTime][locationName] = {};
                    }

                    if (time[k].elementValue) {
                        time[k].parameter = time[k].elementValue;
                    }
                    var parameter = {};
                    for (var key in time[k].parameter[0]) {
                        parameter[key] = time[k].parameter[0][key][0].replace(/\n|\s/g, '');
                    }
                    data[wxName][dataTime][locationName] = parameter;
                }
            }
        }
        output.locationInfo = locationInfo;
        //output.timeList = [];
        // for (var key in data) {
        //     output.timeList.push(key);
        // }
        output.data = data;
        callback(null, output);
    } else {
        callback({ "success": false, "message": "no data" });
    }
}

function genOpenDataRequestURL(code) {
    return "http://opendata.cwb.gov.tw/govdownload?authorizationkey=rdec-key-123-45678-011121314&dataid=" + code;
}

function getFCode(desc) {
    var fCode = {
        "宜蘭縣未來2天天氣預報": "F-D0047-001",
        "宜蘭縣未來1週天氣預報": "F-D0047-003",
        "桃園市未來2天天氣預報": "F-D0047-005",
        "桃園市未來1週天氣預報": "F-D0047-007",
        "新竹縣未來2天天氣預報": "F-D0047-009",
        "新竹縣未來1週天氣預報": "F-D0047-011",
        "苗栗縣未來2天天氣預報": "F-D0047-013",
        "苗栗縣未來1週天氣預報": "F-D0047-015",
        "彰化縣未來2天天氣預報": "F-D0047-017",
        "彰化縣未來1週天氣預報": "F-D0047-019",
        "南投縣未來2天天氣預報": "F-D0047-021",
        "南投縣未來1週天氣預報": "F-D0047-023",
        "雲林縣未來2天天氣預報": "F-D0047-025",
        "雲林縣未來1週天氣預報": "F-D0047-027",
        "嘉義縣未來2天天氣預報": "F-D0047-029",
        "嘉義縣未來1週天氣預報": "F-D0047-031",
        "屏東縣未來2天天氣預報": "F-D0047-033",
        "屏東縣未來1週天氣預報": "F-D0047-035",
        "臺東縣未來2天天氣預報": "F-D0047-037",
        "臺東縣未來1週天氣預報": "F-D0047-039",
        "花蓮縣未來2天天氣預報": "F-D0047-041",
        "花蓮縣未來1週天氣預報": "F-D0047-043",
        "澎湖縣未來2天天氣預報": "F-D0047-045",
        "澎湖縣未來1週天氣預報": "F-D0047-047",
        "基隆市未來2天天氣預報": "F-D0047-049",
        "基隆市未來1週天氣預報": "F-D0047-051",
        "新竹市未來2天天氣預報": "F-D0047-053",
        "新竹市未來1週天氣預報": "F-D0047-055",
        "嘉義市未來2天天氣預報": "F-D0047-057",
        "嘉義市未來1週天氣預報": "F-D0047-059",
        "臺北市未來2天天氣預報": "F-D0047-061",
        "臺北市未來1週天氣預報": "F-D0047-063",
        "高雄市未來2天天氣預報": "F-D0047-065",
        "高雄市未來1週天氣預報": "F-D0047-067",
        "新北市未來2天天氣預報": "F-D0047-069",
        "新北市未來1週天氣預報": "F-D0047-071",
        "臺中市未來2天天氣預報": "F-D0047-073",
        "臺中市未來1週天氣預報": "F-D0047-075",
        "臺南市未來2天天氣預報": "F-D0047-077",
        "臺南市未來1週天氣預報": "F-D0047-079",
        "連江縣未來2天天氣預報": "F-D0047-081",
        "連江縣未來1週天氣預報": "F-D0047-083",
        "金門縣未來2天天氣預報": "F-D0047-085",
        "金門縣未來1週天氣預報": "F-D0047-087"
    }[desc];
    return fCode ? fCode : "";
}

module.exports = Weather;