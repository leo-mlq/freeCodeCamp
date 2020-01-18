/*
 *
 *
 *       Complete the handler logic below
 *
 *
 */

function ConvertHandler() {
  this.getNum = function(input) {
    var result = "-1";
    let numReg = /\d/;
    if (!numReg.test(input)) result = "1";
    else {
      var fraMatch = input.match(/\/+/g);
      if (fraMatch && fraMatch.length >= 2) return result;
      let validReg = /[-]?[0-9]+[,.]?[0-9]*([\/][0-9]+[,.]?[0-9]*)*/g;
      result = input.match(validReg)[0];
    }
    return result;
  };

  this.getUnit = function(input) {
    var num = this.getNum(input);
    let numSpaceReg = /(\d)$/;
    if (num != -1 && (input == undefined || numSpaceReg.test(input)))
      return "no unit";

    var result;
    result = input.match(/(kg|mi|gal|km|L|lbs)$/gi);
    if (!result) return "invalid unit";
    return result[0];
  };

  this.getReturnUnit = function(initUnit) {
    var result;
    switch (initUnit) {
      case "L":
        result = "gal";
        break;
      case "gal":
        result = "L";
        break;
      case "mi":
        result = "km";
        break;
      case "km":
        result = "mi";
        break;
      case "lbs":
        result = "kg";
        break;
      case "kg":
        result = "lbs";
        break;
    }
    return result;
  };

  this.spellOutUnit = function(unit) {
    var result;
    switch (unit) {
      case "L":
        result = "litters";
        break;
      case "gal":
        result = "gallons";
        break;
      case "mi":
        result = "miles";
        break;
      case "km":
        result = "kilometers";
        break;
      case "lbs":
        result = "pounds";
        break;
      case "kg":
        result = "kilograms";
        break;
    }
    return result;
  };

  this.convert = function(initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;
    var result;

    var initNums = initNum.split("/");
    var initRes =
      initNums.length > 1
        ? Number(initNums[0]) / Number(initNums[1])
        : Number(initNums[0]);

    switch (initUnit) {
      case "L":
        result = initRes / galToL;
        break;
      case "gal":
        result = initRes * galToL;
        break;
      case "mi":
        result = initRes * miToKm;
        break;
      case "km":
        result = initRes / miToKm;
        break;
      case "lbs":
        result = initRes * lbsToKg;
        break;
      case "kg":
        result = initRes / lbsToKg;
        break;
    }

    return result;
  };

  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    var result;
    result =
      initNum +
      " " +
      this.spellOutUnit(initUnit) +
      " converts to " +
      returnNum.toString() +
      " " +
      this.spellOutUnit(returnUnit);
    return result;
  };
}

module.exports = ConvertHandler;
