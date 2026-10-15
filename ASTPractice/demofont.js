(function (myArr, num) {
    let xiaojianbang = function (nums) {
        while (--nums) {
            myArr.push(myArr.shift());
        }
    };
    xiaojianbang(++num);
})(arr, 0x10);