// app/index.tsx
import { View } from 'react-native';
import CustomTabs from './components/CustomTab';

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <CustomTabs />
    </View>
  );
}