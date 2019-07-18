/**
 * @description 计算每个图片所在位置
 * @param {Array} param 宽高比列表
 * @param {Object} param config 配置
 * @returns {Array} 返回每一行的图片列表元素data及当前行height,top值
 */
module.exports = function (data = [], config = {}) {
    let layoutConfig = Object.assign({
        containerWidth: 1024,
        containerTop: 20,
        rowSpacing: 10,
        baseRowHeight: 320,
        rowHeightTolerance: 0.25
    }, config);

    let index = 0,
        currentRow = null,
        lastTop = layoutConfig.containerTop,
        rows = [],
        sumTotal = 0;

    let length = data.length;
    while (index < length) {
        let item = data[index];

        if (!currentRow) {
            currentRow = new Row({
                top: lastTop,
                containerWidth: layoutConfig.containerWidth,
                baseRowHeight: layoutConfig.baseRowHeight,
                rowHeightTolerance: layoutConfig.rowHeightTolerance,

            });
        }
        let isAdded = currentRow.addItem(item);
        if (isAdded) {
            if (currentRow.isRowComplete()) {
                addRow();
            }

            index += 1;
        } else {
            if (currentRow.isRowComplete()) {
                currentRow = null;
            }
        }

    }

    function addRow() {
        sumTotal = sumTotal + currentRow.data.length;
        rows.push(currentRow);
        lastTop += currentRow.height + layoutConfig.rowSpacing;
        currentRow = null;

    }

    if (currentRow && currentRow.data.length) {
        currentRow.forceCompleteRow();
        addRow();
    }

    return rows


}

function Row(params) {
    this.top = params.top;
    this.height = params.height || 0;
    this.data = params.data || [];
    this.lastSumAspectRadio = 0;
    this.sumAspectRadio = 0;
    this.containerWidth = params.containerWidth;
    this.baseRowHeight = params.baseRowHeight;
    this.rowHeightTolerance = params.rowHeightTolerance;
    this.minRowAspectRatio = this.containerWidth / params.baseRowHeight * (1 - params.rowHeightTolerance); // 最小比例
    this.maxRowAspectRatio = this.containerWidth / params.baseRowHeight * (1 + params.rowHeightTolerance); // 最大比例
}

Row.prototype.addItem = function (item) {
    var aspectRatio;
    if (item.width && item.height) {
        aspectRatio = item.width / item.height;
    } else {
        aspectRatio = item;
    }
    let lastSumAspectRadio = this.lastSumAspectRadio;
    let sumAspectRadio = this.sumAspectRadio = lastSumAspectRadio + aspectRatio;

    if (sumAspectRadio <= this.minRowAspectRatio) {
        this.data.push(item);
        this.lastSumAspectRadio = sumAspectRadio;
        return true
    } else if (sumAspectRadio >= this.maxRowAspectRatio) { // 如果放进去比最大容忍度还大, 分两种情况

        if (this.data.length === 0) { // 一种是该行没有图片,此图片太宽,则将此图片放进去结束此行.

            this.data.push(item);
            this.completeRow();
            return true;
        } else { // 第二种是该行有很多图片, 放进去进行比较

            let targetAspectRatio = this.containerWidth / this.baseRowHeight;

            if (Math.abs(lastSumAspectRadio - targetAspectRatio) > Math.abs(sumAspectRadio - targetAspectRatio)) {
                this.sumAspectRadio = lastSumAspectRadio;
                this.completeRow();
                return false;
            } else {
                this.data.push(item);
                this.completeRow();
                return true;
            }
        }
    } else {
        this.data.push(item);
        this.completeRow();
        return true;
    }
}
Row.prototype.completeRow = function () {
    let sumAspectRadio = this.sumAspectRadio;
    this.height = Math.floor(this.containerWidth / sumAspectRadio);
    this.lastSumAspectRadio = 0;
    this.sumAspectRadio = 0;
}

Row.prototype.forceCompleteRow = function () {
    this.height = this.baseRowHeight;
    this.lastSumAspectRadio = 0;
    this.sumAspectRadio = 0;
}

Row.prototype.isRowComplete = function () {
    return this.height > 0;
}
