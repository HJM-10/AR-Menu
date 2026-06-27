import React, { useState, useEffect } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { MenuItem, LoggedInUser } from '../types';
import { formatRs } from '../utils/format';
import { styles } from '../styles/styles';
import { getCategories, BackendCategory } from '../api/menu';
import { getAdminOrders, BackendOrder } from '../api/orders';
import { createMenuItem, updateMenuItem, deleteMenuItem } from '../api/adminMenu';

type AdminPage = 'main' | 'addItem' | 'editPrices' | 'orders' | 'superAdmins';

export default function AdminScreen({
  menuItems,
  setMenuItems,
  currentUser,
  onBack,
  onSignOut,
  onOpenCustomerApp,
  onRefreshMenu,
}: {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  currentUser: LoggedInUser | null;
  onBack: () => void;
  onSignOut: () => void;
  onOpenCustomerApp: () => void;
  onRefreshMenu: () => void;
}) {
  const [page, setPage] = useState<AdminPage>('main');

  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<BackendCategory | null>(null);
  const [itemPrice, setItemPrice] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  
  const [loading, setLoading] = useState(false);

  const [superAdmins, setSuperAdmins] = useState<string[]>([
    'admin@3dfv.pk',
  ]);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Fetch categories when opening add item
  useEffect(() => {
    if (page === 'addItem') {
      getCategories().then(res => {
        setCategories(res.data || []);
        if (res.data && res.data.length > 0) {
          setItemCategory(res.data[0]);
        }
      }).catch(() => {
        // failed to load categories
      });
    } else if (page === 'orders') {
      setLoading(true);
      getAdminOrders().then(res => {
        setOrders(res.data || []);
      }).catch(err => {
        Alert.alert('Error', 'Failed to load orders');
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [page]);

  const goBackInsideAdmin = () => {
    if (page === 'main') {
      onBack(); // Goes to home
    } else {
      setPage('main');
    }
  };

  const addMenuItem = async () => {
    if (!itemName.trim() || !itemCategory || !itemPrice.trim() || !itemDescription.trim()) {
      Alert.alert('Missing Details', 'Please fill all item fields.');
      return;
    }

    const priceNumber = Number(itemPrice);

    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    setLoading(true);
    try {
      await createMenuItem({
        category_id: itemCategory.id,
        name: itemName.trim(),
        description: itemDescription.trim(),
        price: priceNumber,
      });
      
      Alert.alert('Item Added', `${itemName} has been added to the customer menu.`);
      
      setItemName('');
      setItemPrice('');
      setItemDescription('');
      
      onRefreshMenu();
    } catch (e: any) {
      Alert.alert('Failed', e.response?.data?.message || 'Could not add item');
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = async (id: string, newPrice: string) => {
    const priceNumber = Number(newPrice);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      return;
    }

    // Optimistic update
    setMenuItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, price: priceNumber } : item
      )
    );
  };
  
  const saveAllPrices = async () => {
    setLoading(true);
    try {
      // Loop over items and update - naive approach but works for demo
      for (const item of menuItems) {
        await updateMenuItem(item.id, { price: item.price });
      }
      Alert.alert('Saved', 'Prices updated successfully.');
      onRefreshMenu();
    } catch (e: any) {
      Alert.alert('Error', 'Some prices failed to update.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = (id: string, name: string) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteMenuItem(id);
              onRefreshMenu();
            } catch (e: any) {
              Alert.alert('Error', 'Failed to delete item.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const addSuperAdmin = () => {
    const cleanedEmail = newAdminEmail.toLowerCase().trim();

    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (superAdmins.includes(cleanedEmail)) {
      Alert.alert('Already Exists', 'This email is already a super admin.');
      return;
    }

    setSuperAdmins((current) => [...current, cleanedEmail]);
    setNewAdminEmail('');

    Alert.alert('Super Admin Added', `${cleanedEmail} was added.`);
  };

  const removeSuperAdmin = (email: string) => {
    Alert.alert(
      'Remove Super Admin',
      `Remove ${email} from super admin users?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSuperAdmins((current) =>
              current.filter((item) => item !== email)
            );
          },
        },
      ]
    );
  };

  if (page === 'addItem') {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.pagePad}>
          <Header title="Add Menu Item" onBack={goBackInsideAdmin} />

          <View style={styles.checkoutCard}>
            <Text style={styles.sectionTitle}>New Food Item</Text>
            <Text style={styles.mutedText}>
              Add a fast food item. It will appear in the customer menu instantly.
            </Text>
          </View>

          <TextInput
            value={itemName}
            onChangeText={setItemName}
            placeholder="Item name e.g. Zinger Burger"
            style={styles.input}
          />

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
            Select Category
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10 }}
          >
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setItemCategory(cat)}
                style={[
                  styles.portionBtn,
                  {
                    marginRight: 10,
                    paddingHorizontal: 16,
                    flex: 0,
                  },
                  itemCategory?.id === cat.id && styles.portionActive,
                ]}
              >
                <Text
                  style={[
                    styles.portionText,
                    itemCategory?.id === cat.id && styles.portionTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <TextInput
            value={itemPrice}
            onChangeText={setItemPrice}
            placeholder="Price in Rs."
            keyboardType="number-pad"
            style={styles.input}
          />

          <TextInput
            value={itemDescription}
            onChangeText={setItemDescription}
            placeholder="Short description"
            style={styles.input}
            multiline
          />

          <Pressable style={styles.primaryBtn} onPress={addMenuItem} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Add Item</Text>}
          </Pressable>

          <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
            Current Menu Items
          </Text>

          {menuItems.map((item) => (
            <View key={item.id} style={styles.adminCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminCardText}>{item.name}</Text>
                <Text style={styles.mutedText}>
                  {item.category} • {formatRs(item.price)}
                </Text>
              </View>

              <Pressable onPress={() => handleDeleteMenuItem(item.id, item.name)}>
                <Ionicons name="trash-outline" size={22} color="#E64B4B" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === 'editPrices') {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.pagePad}>
          <Header title="Edit Prices" onBack={goBackInsideAdmin} />

          <View style={styles.checkoutCard}>
            <Text style={styles.sectionTitle}>Update Item Prices</Text>
            <Text style={styles.mutedText}>
              Change prices in Pakistani Rupees. These prices update the customer menu.
            </Text>
          </View>

          {menuItems.map((item) => (
             <View key={item.id} style={styles.adminCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminCardText}>{item.name}</Text>
                <Text style={styles.mutedText}>{item.category}</Text>
              </View>

              <TextInput
                value={String(item.price)}
                onChangeText={(value) => updatePrice(item.id, value)}
                keyboardType="number-pad"
                style={[
                  styles.input,
                  {
                    width: 95,
                    marginTop: 0,
                    textAlign: 'center',
                    paddingVertical: 10,
                  },
                ]}
              />
            </View>
          ))}

          <Pressable
            style={styles.primaryBtn}
            onPress={saveAllPrices}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save Prices</Text>}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === 'orders') {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.pagePad}>
          <Header title="Order History" onBack={goBackInsideAdmin} />

          <View style={styles.checkoutCard}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <Text style={styles.mutedText}>
              View customer orders and their current status.
            </Text>
          </View>

          {loading ? (
             <ActivityIndicator size="large" color="#35C989" style={{ marginTop: 40 }} />
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.checkoutCard}>
                <Text style={styles.foodName}>{order.id.slice(0, 8).toUpperCase()}</Text>
                <Text style={styles.mutedText}>Customer: {order.customer_name}</Text>
                <Text style={styles.mutedText}>
                  Items: {order.items.map(i => `${i.quantity}x`).join(', ')} (IDs only for now)
                </Text>
                <Text style={styles.mutedText}>Phone: {order.customer_phone}</Text>
                <Text style={styles.boldText}>{formatRs(Number(order.total_amount))}</Text>

                <View
                  style={{
                    marginTop: 10,
                    backgroundColor: '#E7F8EF',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ color: '#35C989', fontWeight: '800' }}>
                    {order.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === 'superAdmins') {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.pagePad}>
          <Header title="Super Admin Users" onBack={goBackInsideAdmin} />

          <View style={styles.checkoutCard}>
            <Text style={styles.sectionTitle}>Manage Super Admins</Text>
            <Text style={styles.mutedText}>
              Add or remove admin emails for your project demo.
            </Text>
          </View>

          <TextInput
            value={newAdminEmail}
            onChangeText={setNewAdminEmail}
            placeholder="Enter admin email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Pressable style={styles.primaryBtn} onPress={addSuperAdmin}>
            <Text style={styles.primaryBtnText}>Add Super Admin</Text>
          </Pressable>

          <Text style={[styles.sectionTitle, { marginTop: 22 }]}>
            Current Super Admins
          </Text>

          {superAdmins.map((email) => (
             <View key={email} style={styles.adminCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminCardText}>{email}</Text>
                <Text style={styles.mutedText}>Super admin access</Text>
              </View>

              <Pressable onPress={() => removeSuperAdmin(email)}>
                <Ionicons name="trash-outline" size={22} color="#E64B4B" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.pagePad}>
        <Header title="Admin Panel" onBack={onBack} />

        <Text style={styles.mutedText}>
          Logged in as: {currentUser?.full_name} ({currentUser?.role})
        </Text>
        <Text style={styles.mutedText}>
          Manage menu items, prices, orders, and super admin users.
        </Text>
        <View style={{ height: 16 }} />

        {currentUser?.role === 'content_admin' || currentUser?.role === 'super_admin' ? (
          <>
            <Pressable style={styles.adminCard} onPress={() => setPage('addItem')}>
              <Text style={styles.adminCardText}>Add menu item</Text>
              <Ionicons name="chevron-forward" size={22} color="#999" />
            </Pressable>

            <Pressable
              style={styles.adminCard}
              onPress={() => setPage('editPrices')}
            >
              <Text style={styles.adminCardText}>Edit prices in Pakistani Rupees</Text>
              <Ionicons name="chevron-forward" size={22} color="#999" />
            </Pressable>
          </>
        ) : null}

        {currentUser?.role === 'order_manager' || currentUser?.role === 'super_admin' ? (
          <Pressable style={styles.adminCard} onPress={() => setPage('orders')}>
            <Text style={styles.adminCardText}>View order history</Text>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </Pressable>
        ) : null}

        {currentUser?.role === 'super_admin' ? (
          <Pressable
            style={styles.adminCard}
            onPress={() => setPage('superAdmins')}
          >
            <Text style={styles.adminCardText}>Manage super admin users</Text>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </Pressable>
        ) : null}

        <Pressable style={styles.primaryBtn} onPress={onOpenCustomerApp}>
          <Text style={styles.primaryBtnText}>Open Customer App</Text>
        </Pressable>

        <Pressable
          style={[styles.adminCard, { marginTop: 6, borderWidth: 1, borderColor: '#E64B4B' }]}
          onPress={onSignOut}
        >
          <Text style={[styles.adminCardText, { color: '#E64B4B' }]}>Sign Out</Text>
          <Ionicons name="log-out-outline" size={22} color="#E64B4B" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}