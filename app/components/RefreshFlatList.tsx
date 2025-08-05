// components/RefreshableFlatList.tsx

import React from 'react';
import { FlatList, FlatListProps, RefreshControl } from 'react-native';

type Props<T> = FlatListProps<T> & {
  isRefreshing: boolean;
  onRefresh: () => void;
};

export default function RefreshableFlatList<T>({
  isRefreshing,
  onRefresh,
  ...rest
}: Props<T>) {
  return (
    <FlatList
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      {...rest}
    />
  );
}
