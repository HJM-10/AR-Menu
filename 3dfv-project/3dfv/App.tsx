/**
 * App.tsx — Main application entry point
 *
 * Integration changes from original:
 * 1. Auth is now real — calls POST /auth/login and POST /auth/register
 * 2. JWT is stored in SecureStore; admin role comes from backend user.role.name
 * 3. OTP screen is bypassed (no backend OTP endpoint)
 * 4. Menu data fetched from GET /menu-items on login success
 * 5. Admin menu operations wired to real API calls
 * 6. Checkout calls POST /orders with real backend UUID item IDs
 * 7. Payment calls POST /payments with real order ID
 *
 * UI is preserved exactly as before — only data sources and event handlers changed.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, View } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { CartItem, Category, Flow, LoggedInUser, MenuItem } from './src/types';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import AdminScreen from './src/screens/AdminScreen';
import HomeScreen from './src/screens/HomeScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import CardPaymentScreen from './src/screens/CardPaymentScreen';
import ThanksScreen from './src/screens/ThanksScreen';

import CustomizerModal from './src/modals/CustomizerModal';
import ChatModal from './src/modals/ChatModal';

// API modules
import {
  login as apiLogin,
  loginWithGoogle as apiLoginWithGoogle,
  register as apiRegister,
  getMe,
} from './src/api/auth';
import type { BackendUser } from './src/api/auth';
import { getMenuItems } from './src/api/menu';
import { createOrder } from './src/api/orders';
import { getGateways, createPayment } from './src/api/payments';
import { saveToken, clearToken, saveUser, getToken } from './src/services/tokenStorage';

// Adapter: convert backend MenuItem to frontend MenuItem
import type { BackendMenuItem } from './src/api/menu';

WebBrowser.maybeCompleteAuthSession();

function adaptMenuItem(item: BackendMenuItem): MenuItem {
  return {
    id: item.id,
    name: item.name,
    category: (item.category?.name ?? 'Other') as Category,
    price: parseFloat(item.price),
    description: item.description ?? '',
    image: item.image_url ?? 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    tags: [],
    pairingSuggestion: '',
    // preserve backend fields for admin operations
    category_id: item.category_id,
    image_url: item.image_url ?? undefined,
    ar_enabled: item.ar_enabled,
    is_available: item.is_available,
    model_3d_url: item.model_3d_url,
  };
}

function adaptBackendUser(backendUser: BackendUser): LoggedInUser {
  return {
    id: backendUser.id,
    email: backendUser.email,
    full_name: backendUser.full_name,
    phone: backendUser.phone,
    is_active: backendUser.is_active,
    role: backendUser.role?.name ?? 'customer',
  };
}

/** Helper to extract a readable error message from Axios errors */
function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: { message?: string; detail?: unknown } };
    };
    const msg = axiosError.response?.data?.message;
    if (msg) return msg;
    // 422 validation errors — detail is an array of objects
    const detail = axiosError.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string; loc?: string[] };
      return first?.msg ? `${first.msg} (${(first.loc ?? []).join('.')})` : 'Validation error';
    }
    return 'Something went wrong. Please try again.';
  }
  return 'Network error. Please check your connection.';
}

export default function App() {
  const [flow, setFlow] = useState<Flow>('splash');
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // ── Auth state ────────────────────────────────────────────────────────────
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const pendingAuthActionRef = useRef<(() => void) | null>(null);

  // ── Logged-in user (from backend) ─────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);

  // ── Menu state ────────────────────────────────────────────────────────────
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');

  // ── Cart state ────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // ── Checkout state ────────────────────────────────────────────────────────
  const [payment, setPayment] = useState('Cash on Counter');
  const [customerPhone, setCustomerPhone] = useState('');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // ── Derived values ────────────────────────────────────────────────────────
  const isAdmin =
    currentUser?.role === 'content_admin' ||
    currentUser?.role === 'order_manager' ||
    currentUser?.role === 'super_admin';

  const googleExtra = Constants.expoConfig?.extra ?? {};
  const googleWebClientId = (googleExtra.googleWebClientId as string | undefined) || '';
  const googleAndroidClientId = (googleExtra.googleAndroidClientId as string | undefined) || '';
  const googleIosClientId = (googleExtra.googleIosClientId as string | undefined) || '';
  const googleClientPlaceholder = 'missing-google-client-id.apps.googleusercontent.com';
  const googleClientConfigured = Boolean(
    Platform.select({
      ios: googleIosClientId,
      android: googleAndroidClientId,
      default: googleWebClientId,
    })
  );
  const [googleRequest, , promptGoogleAsync] = Google.useIdTokenAuthRequest({
    webClientId: googleWebClientId || googleClientPlaceholder,
    androidClientId: googleAndroidClientId || googleClientPlaceholder,
    iosClientId: googleIosClientId || googleClientPlaceholder,
    selectAccount: true,
  });

  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      const categoryMatch = category === 'All' || item.category === category;
      const queryMatch =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase());
      return categoryMatch && queryMatch;
    });
  }, [category, query, menuItems]);

  const subtotal = cart.reduce((total, line) => total + line.item.price * line.quantity, 0);
  const tax = Math.round(subtotal * 0.16);
  const total = subtotal + tax;

  // ── Restore session on app start ──────────────────────────────────────────
  useEffect(() => {
    async function restoreSession() {
      const token = await getToken();
      if (!token) {
        await clearToken();
        return;
      }

      try {
        const result = await getMe();
        const user = adaptBackendUser(result.data);
        await saveUser(user);
        setCurrentUser(user);
        setName(user.full_name);
        setEmail(user.email);
        // Navigate directly — skip splash/onboarding/auth
        const adminRole =
          user.role === 'content_admin' ||
          user.role === 'order_manager' ||
          user.role === 'super_admin';
        setFlow(adminRole ? 'admin' : 'home');
      } catch {
        await clearToken();
        setCurrentUser(null);
      }
    }

    restoreSession();
  }, []);

  // ── Fetch menu whenever user lands on home screen ─────────────────────────
  useEffect(() => {
    if (flow === 'home' || flow === 'admin' || flow === 'itemDetail') {
      fetchMenu();
    }
  }, [flow]);

  useEffect(() => {
    if (Platform.OS !== 'web' || menuItems.length === 0 || detailItem) return;
    const search = globalThis.location?.search ?? '';
    const params = new URLSearchParams(search);
    const itemId = params.get('itemId') || params.get('menuItemId');
    if (!itemId) return;

    const qrItem = menuItems.find((item) => item.id === itemId);
    if (qrItem) {
      setDetailItem(qrItem);
      setFlow('itemDetail');
    }
  }, [menuItems, detailItem]);

  async function fetchMenu() {
    setMenuLoading(true);
    try {
      const result = await getMenuItems();
      setMenuItems((result.data ?? []).map(adaptMenuItem));
    } catch (e) {
      console.warn('[Menu] fetch failed', e);
      // Keep existing items if any; don't crash the app
    } finally {
      setMenuLoading(false);
    }
  }

  // ── Authentication handler ────────────────────────────────────────────────
  async function handleAuth() {
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter your email and password.');
      return;
    }
    if (authTab === 'signup' && !name.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      let user: LoggedInUser;

      if (authTab === 'login') {
        const result = await apiLogin(email.trim(), password);
        const token = result.data.access_token;
        user = adaptBackendUser(result.data.user);
        await saveToken(token);
        await saveUser(user);
      } else {
        // Register first, then log in automatically
        await apiRegister(name.trim(), email.trim(), password);
        const loginResult = await apiLogin(email.trim(), password);
        const token = loginResult.data.access_token;
        user = adaptBackendUser(loginResult.data.user);
        await saveToken(token);
        await saveUser(user);
      }

      completeAuth(user);

      // Skip OTP — no backend OTP endpoint exists
      // Navigate directly to admin or home based on role
    } catch (error) {
      setAuthError(getErrorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  }

  // ── Cart helpers ──────────────────────────────────────────────────────────
  function completeAuth(user: LoggedInUser) {
    setCurrentUser(user);
    setName(user.full_name);
    setEmail(user.email);
    setAuthPromptMessage('');

    const adminRole =
      user.role === 'content_admin' ||
      user.role === 'order_manager' ||
      user.role === 'super_admin';

    const pendingAction = pendingAuthActionRef.current;
    if (pendingAction) {
      pendingAuthActionRef.current = null;
      pendingAction();
      return;
    }

    setFlow(adminRole ? 'admin' : 'home');
  }

  function requireAuth(actionAfterLogin: () => void) {
    if (currentUser) {
      actionAfterLogin();
      return;
    }

    pendingAuthActionRef.current = actionAfterLogin;
    setAuthError('');
    setAuthPromptMessage('Please sign in or create an account to continue.');
    setAuthTab('login');
    setPassword('');
    setFlow('auth');
  }

  async function handleGoogleAuth() {
    if (!googleClientConfigured) {
      setAuthError('Add your Google OAuth client ID before using Google sign-in.');
      return;
    }

    setAuthError('');
    setGoogleLoading(true);

    try {
      const googleResult = await promptGoogleAsync();
      if (googleResult.type !== 'success') {
        if (googleResult.type !== 'cancel' && googleResult.type !== 'dismiss') {
          setAuthError('Google sign-in was not completed.');
        }
        return;
      }

      const idToken = googleResult.params.id_token;
      if (!idToken) {
        setAuthError('Google did not return an ID token. Check the OAuth client configuration.');
        return;
      }

      const result = await apiLoginWithGoogle(idToken);
      const user = adaptBackendUser(result.data.user);
      await saveToken(result.data.access_token);
      await saveUser(user);
      completeAuth(user);
    } catch (error) {
      setAuthError(getErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  }

  const addToCart = (item: MenuItem, extras?: Partial<CartItem>) => {
    setCart((current) => {
      const found = current.find(
        (line) =>
          line.item.id === item.id &&
          line.portion === (extras?.portion || 'Standard')
      );
      if (found) {
        return current.map((line) =>
          line === found ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [
        ...current,
        {
          item,
          quantity: 1,
          notes: extras?.notes || '',
          portion: extras?.portion || 'Standard',
          addons: extras?.addons || [],
        },
      ];
    });
  };

  const addToCartAndStay = (item: MenuItem, extras?: Partial<CartItem>) => {
    addToCart(item, extras);
    setSelectedItem(null);
  };

  const openCustomizer = (item: MenuItem) => {
    requireAuth(() => {
      setDetailItem(item);
      setFlow('itemDetail');
      setSelectedItem(item);
    });
  };

  const openCart = () => {
    requireAuth(() => setFlow('cart'));
  };

  const openCheckout = () => {
    requireAuth(() => setFlow('checkout'));
  };

  const updateQuantity = (index: number, change: number) => {
    setCart((current) =>
      current
        .map((line, i) =>
          i === index ? { ...line, quantity: line.quantity + change } : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  // ── Checkout / Order placement ────────────────────────────────────────────
  async function handlePlaceOrder() {
    if (!currentUser) {
      requireAuth(() => setFlow('checkout'));
      return;
    }

    if (!customerPhone.trim()) {
      Alert.alert('Phone Required', 'Please enter your phone number to place the order.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const orderPayload = {
        customer_name: currentUser?.full_name || name || 'Guest',
        customer_phone: customerPhone.trim(),
        items: cart.map((line) => ({
          menu_item_id: line.item.id,
          quantity: line.quantity,
          notes: line.notes || undefined,
        })),
      };

      const result = await createOrder(orderPayload);
      const orderId = result.data.id;
      setLastOrderId(orderId);

      if (payment === 'Debit/Credit Card') {
        setFlow('cardPayment');
      } else {
        // Cash — only attempt payment record if user is authenticated
        // (POST /payments requires a JWT token)
        if (currentUser) {
          try {
            const gateways = await getGateways();
            const cashGateway = (gateways.data ?? []).find((g) => g.code === 'cash');
            if (cashGateway) {
              await createPayment({
                order_id: orderId,
                gateway_id: cashGateway.id,
                amount: total,
              });
            }
          } catch {
            // Payment record creation failed — order still placed successfully
            console.warn('[Payment] Failed to create cash payment record');
          }
        }
        setCustomerPhone(''); // clear for next order
        setFlow('thanks');
      }
    } catch (error) {
      Alert.alert('Order Failed', getErrorMessage(error));
    } finally {
      setCheckoutLoading(false);
    }
  }

  // ── Card payment handler ──────────────────────────────────────────────────
  async function handleCardPay() {
    if (!currentUser) {
      requireAuth(() => setFlow('checkout'));
      return;
    }

    if (!lastOrderId) {
      setFlow('thanks');
      return;
    }
    try {
      const gateways = await getGateways();
      const cardGateway = (gateways.data ?? []).find((g) => g.code === 'card_terminal');
      if (cardGateway) {
        await createPayment({
          order_id: lastOrderId,
          gateway_id: cardGateway.id,
          amount: total,
        });
      }
    } catch {
      console.warn('[Payment] Card payment record creation failed');
    }
    setFlow('thanks');
  }

  // ── Sign out ──────────────────────────────────────────────────────────────
  function handleSignOut() {
    clearToken();
    pendingAuthActionRef.current = null;
    setCurrentUser(null);
    setCart([]);
    setName('');
    setEmail('');
    setPassword('');
    setAuthError('');
    setAuthPromptMessage('');
    setFlow('home');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Screen rendering
  // ─────────────────────────────────────────────────────────────────────────

  if (flow === 'splash') {
    return <SplashScreen onStart={() => setFlow('onboarding')} />;
  }

  if (flow === 'onboarding') {
    return (
      <OnboardingScreen
        index={onboardingIndex}
        setIndex={setOnboardingIndex}
        onDone={() => setFlow('home')}
      />
    );
  }

  if (flow === 'auth') {
    return (
      <AuthScreen
        authTab={authTab}
        setAuthTab={setAuthTab}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isAdmin={false}
        loading={authLoading}
        errorMessage={authError}
        promptMessage={authPromptMessage}
        onContinue={handleAuth}
        onGoogleContinue={handleGoogleAuth}
        onCancel={() => {
          pendingAuthActionRef.current = null;
          setAuthError('');
          setAuthPromptMessage('');
          setFlow(detailItem ? 'itemDetail' : 'home');
        }}
        googleLoading={googleLoading}
        googleDisabled={!googleClientConfigured || !googleRequest || authLoading}
      />
    );
  }

  if (flow === 'admin') {
    return (
      <AdminScreen
        menuItems={menuItems}
        setMenuItems={setMenuItems}
        currentUser={currentUser}
        onBack={() => setFlow('home')}  // back goes to home, not logout
        onSignOut={handleSignOut}
        onOpenCustomerApp={() => setFlow('home')}
        onRefreshMenu={fetchMenu}
      />
    );
  }

  if (flow === 'cart') {
    return (
      <CartScreen
        cart={cart}
        subtotal={subtotal}
        tax={tax}
        total={total}
        updateQuantity={updateQuantity}
        onBack={() => setFlow('home')}
        onCheckout={openCheckout}
      />
    );
  }

  if (flow === 'itemDetail' && detailItem) {
    return (
      <>
        <ItemDetailScreen
          item={detailItem}
          onBack={() => setFlow('home')}
          onAddToCart={(item) => {
            requireAuth(() => {
              addToCartAndStay(item, {
                portion: 'Standard',
                notes: '',
                addons: [],
              });
              setFlow('itemDetail');
            });
          }}
          onCustomize={openCustomizer}
        />

        <CustomizerModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={(item, extras) => {
            requireAuth(() => addToCartAndStay(item, extras));
          }}
        />
      </>
    );
  }

  if (flow === 'checkout') {
    return (
      <CheckoutScreen
        payment={payment}
        setPayment={setPayment}
        total={total}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        loading={checkoutLoading}
        onBack={() => setFlow('cart')}
        onPlaceOrder={handlePlaceOrder}
        onCardPayment={handlePlaceOrder}
      />
    );
  }

  if (flow === 'cardPayment') {
    return (
      <CardPaymentScreen
        total={total}
        onBack={() => setFlow('checkout')}
        onPay={handleCardPay}
      />
    );
  }

  if (flow === 'thanks') {
    return (
      <ThanksScreen
        onBackHome={() => {
          setCart([]);
          setLastOrderId(null);
          setPayment('Cash on Counter'); // reset payment selection
          setFlow('home');
        }}
      />
    );
  }

  // Default — home screen
  return (
    <>
      {menuLoading && (
        <View style={{ position: 'absolute', top: 60, left: 0, right: 0, zIndex: 999, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#35C989" />
        </View>
      )}
      <HomeScreen
        categories={['All', ...Array.from(new Set(menuItems.map(item => item.category)))]}
        name={currentUser?.full_name || name || 'Guest'}
        query={query}
        setQuery={setQuery}
        category={category}
        setCategory={setCategory}
        filteredMenu={filteredMenu}
        cart={cart}
        isAdmin={isAdmin}
        isGuest={!currentUser}
        onProfilePress={() => {
          setAuthPromptMessage('');
          if (isAdmin) {
            setFlow('admin');
          } else if (!currentUser) {
            setFlow('auth');
          }
        }}
        onSignOut={handleSignOut}
        onCartPress={openCart}
        onOpenItemDetail={(item) => {
          setDetailItem(item);
          setFlow('itemDetail');
        }}
        onOpenCustomizer={openCustomizer}
        onOpenChat={() => setChatOpen(true)}
      />

      <CustomizerModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAdd={(item, extras) => {
          requireAuth(() => addToCartAndStay(item, extras));
        }}
      />

      <ChatModal visible={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
