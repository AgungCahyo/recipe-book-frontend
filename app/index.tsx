// app/index.tsx
import { View } from 'react-native';
import CustomTabs from './components/CustomTab';
// app/index.tsx
console.log('[index] rendered');

export default function Index() {
  // console.error = (...args) => {
  // if (
  //   typeof args[0] === 'string' &&
  //   args[0].includes('Text strings must be rendered')
  // ) {
  //   console.log('❗️Detected illegal text render');
  // } else {
  //   console.warn(...args);
  // }
// };
  return (
    <View style={{ flex: 1 }}>
      <CustomTabs />
    </View>
  );
}
