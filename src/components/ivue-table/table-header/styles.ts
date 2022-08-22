import { inject } from 'vue';

import { getFixedColumnsClass, getFixedColumnOffset, ensurePosition } from '../utils';

// ts
import type { TableHeaderProps } from './index';
import type { TableColumnCtx } from '../table-column/defaults';

const prefixCls = 'ivue-table';

function useStyle<T>(props: TableHeaderProps<T>) {
  // inject
  const IvueTable: any = inject(prefixCls);


  // 头部行样式
  const getHeaderCellStyle = (
    rowIndex: number,
    columnIndex: number,
    row: T,
    column: TableColumnCtx<T>
  ) => {

    let headerCellStyles = IvueTable?.props.headerCellStyle ?? {};

    if (typeof headerCellStyles === 'function') {
      headerCellStyles = headerCellStyles.call(null, {
        rowIndex,
        columnIndex,
        row,
        column,
      });
    }

    // fixedStyle
    const fixedStyle = column.isSubColumn
      ? null
      : getFixedColumnOffset<T>(
        columnIndex,
        column.fixed,
        props.store,
        row as unknown as TableColumnCtx<T>[]
      );

    // 左边
    ensurePosition(fixedStyle, 'left');
    // 右边
    ensurePosition(fixedStyle, 'right');

    return Object.assign({}, headerCellStyles, fixedStyle);
  };

  // 头部行样式
  const getHeaderCellClass = (
    rowIndex: number,
    columnIndex: number,
    row: T,
    column: TableColumnCtx<T>
  ) => {

    // 固定列样式
    const fixedClasses = column.isSubColumn
      ? []
      : getFixedColumnsClass<T>(
        prefixCls,
        columnIndex,
        column.fixed,
        props.store,
        row as unknown as TableColumnCtx<T>[]
      );

    // class
    const classes = [
      column.id,
      column.order,
      column.headerAlign,
      column.className,
      column.labelClassName,
      ...fixedClasses,
    ];

    // 没有子项
    if (!column.children) {
      classes.push('is-leaf');
    }

    // 排序
    if (column.sortable) {
      classes.push('is-sortable');
    }

    // 过滤
    if (column.filterable) {
      classes.push('is-filterable');
    }

    // 表头单元格的 className 的回调方法，
    // 也可以使用字符串为所有表头单元格设置一个固定的 className
    const headerCellClassName = IvueTable?.props.headerCellClassName;

    // 字符串
    if (typeof headerCellClassName === 'string') {
      classes.push(headerCellClassName);
    }
    // 方法
    else if (typeof headerCellClassName === 'function') {
      classes.push(
        headerCellClassName.call(null, {
          rowIndex,
          columnIndex,
          row,
          column,
        })
      );
    }

    // cell
    classes.push(`${prefixCls}-cell`);

    // 过滤
    return classes.filter((className) => Boolean(className)).join(' ');
  };


  return {
    getHeaderCellClass,
    getHeaderCellStyle,
  };
}

export default useStyle;
