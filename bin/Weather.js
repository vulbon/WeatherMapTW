var Weather = {};

// fcode => http://opendata.cwb.gov.tw/datalist

Weather.h = function (query) {
    var fCode = "F-C0032-001";
    console.log(fCode);
    return genOpenDataRequestURL(fCode);
}

Weather.d = function (query) {
    if (query.county) {
        var county = query.county.replace("台", "臺");
        var fCode = getFCode(county + "未來2天天氣預報");
        return genOpenDataRequestURL(fCode);
    } else {
        return null;
    }
}

Weather.w = function (query) {
    if (query.county) {
        var county = query.county.replace("台", "臺");
        var fCode = getFCode(county + "未來1週天氣預報");
        return genOpenDataRequestURL(fCode);
    } else {
        return genOpenDataRequestURL("F-C0032-005");
    }
}


function genOpenDataRequestURL(code) {
    return "http://opendata.cwb.gov.tw/govdownload?authorizationkey=rdec-key-123-45678-011121314&dataid=" + code;
}

function getFCode(desc) {
    return fCodeTable[desc] ? fCodeTable[desc] : "";
}

var fCodeTable = {
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
}

module.exports = Weather;