"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 3,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + height) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      style={{ height, overflow: "auto" }}
      className="border border-gray-200 rounded-lg"
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: "absolute",
              top: (startIndex + index) * itemHeight,
              width: "100%",
              height: itemHeight,
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// 轻量级虚拟列表（适用于数据量不是特别大的情况）
interface SimpleVirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  threshold?: number; // 超过这个数量才启用虚拟滚动
}

export function SimpleVirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  threshold = 50,
}: SimpleVirtualListProps<T>) {
  // 如果项目数量小于阈值，直接渲染所有项目
  if (items.length < threshold) {
    return (
      <div
        style={{ height, overflow: "auto" }}
        className="border border-gray-200 rounded-lg"
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{ height: itemHeight }}
            className="border-b border-gray-100 last:border-b-0"
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  // 否则使用虚拟滚动
  return (
    <VirtualList
      items={items}
      itemHeight={itemHeight}
      height={height}
      renderItem={renderItem}
    />
  );
}

// 分页列表组件
interface PaginatedListProps<T> {
  items: T[];
  itemsPerPage: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onPageChange?: (page: number) => void;
}

export function PaginatedList<T>({
  items,
  itemsPerPage,
  renderItem,
  onPageChange,
}: PaginatedListProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="space-y-2">
        {currentItems.map((item, index) => (
          <div key={startIndex + index}>
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}

      <div className="text-center text-sm text-gray-500 mt-2">
        显示 {startIndex + 1} - {Math.min(endIndex, items.length)} / 共{" "}
        {items.length} 项
      </div>
    </div>
  );
}

// 无限滚动列表组件
interface InfiniteListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  itemHeight?: number;
  containerHeight?: number;
}

export function InfiniteList<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading,
  itemHeight = 60,
  containerHeight = 400,
}: InfiniteListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    setScrollTop(currentScrollTop);

    const scrollHeight = e.currentTarget.scrollHeight;
    const clientHeight = e.currentTarget.clientHeight;

    // 当滚动到底部附近时，加载更多数据
    if (scrollHeight - currentScrollTop - clientHeight < 200 && hasMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      style={{ height: containerHeight, overflow: "auto" }}
      className="border border-gray-200 rounded-lg"
    >
      <div>
        {items.map((item, index) => (
          <div
            key={index}
            style={{ height: itemHeight }}
            className="border-b border-gray-100 last:border-b-0"
          >
            {renderItem(item, index)}
          </div>
        ))}

        {loading && (
          <div
            style={{ height: itemHeight }}
            className="flex items-center justify-center text-gray-500"
          >
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
            加载中...
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <div
            style={{ height: itemHeight }}
            className="flex items-center justify-center text-gray-500 text-sm"
          >
            已加载全部数据
          </div>
        )}
      </div>
    </div>
  );
}