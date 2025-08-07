// app/index.tsx
import CustomTabs from './components/CustomTab';

export default function IndexPage() {
  return <CustomTabs />;
}

export const unstable_settings = {
  initialRouteName: 'index',
};

export const options = {
  headerShown: false,
};
