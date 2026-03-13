import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { useCart } from '@/store/cart';

/**
 * Tab layout with cart badge on Scan tab (MOB-A001).
 */

function CartBadgeIcon({ color }: { color: string }) {
  const { itemCount } = useCart();
  const count = itemCount();

  return (
    <View>
      <Text style={{ fontSize: 24, color }}>{'scan'}</Text>
      {count > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -10,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: '#EF4444',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
            {count > 99 ? '99+' : String(count)}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <CartBadgeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>{'orders'}</Text>,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>{'people'}</Text>,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catalog',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>{'catalog'}</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>{'settings'}</Text>,
        }}
      />
    </Tabs>
  );
}
