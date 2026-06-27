import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, CartItem, MenuItem } from '../types';
import { formatRs } from '../utils/format';
import { styles } from '../styles/styles';
import WeatherCard from '../components/WeatherCard';



const CATEGORY_EMOJIS: Record<Category, string> = {
  All: '🍽️',
  Burgers: '🍔',
  Pizza: '🍕',
  Fries: '🍟',
  Wraps: '🌯',
  Sandwiches: '🥪',
  Drinks: '🥤',
};

export default function HomeScreen({
  categories,
  name,
  query,
  setQuery,
  category,
  setCategory,
  filteredMenu,
  cart,
  isAdmin,
  isGuest,
  onProfilePress,
  onSignOut,
  onCartPress,
  onOpenItemDetail,
  onOpenArLanding,
  onOpenCustomizer,
  onOpenChat,
}: {
  categories: Category[];
  name: string;
  query: string;
  setQuery: (value: string) => void;
  category: Category;
  setCategory: (value: Category) => void;
  filteredMenu: MenuItem[];
  cart: CartItem[];
  isAdmin: boolean;
  isGuest: boolean;
  onProfilePress: () => void;
  onSignOut: () => void;
  onCartPress: () => void;
  onOpenItemDetail: (item: MenuItem) => void;
  onOpenArLanding: (item: MenuItem) => void;
  onOpenCustomizer: (item: MenuItem) => void;
  onOpenChat: () => void;
}) {
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.pagePad}>
        <View style={styles.homeTop}>
          <View>
            <Text style={styles.overline}>3DFV</Text>
            <Text style={styles.locationTitle}>3D Food Visualisation</Text>
          </View>

          <WeatherCard />
        </View>

        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.homeTitle}>Good Morning!</Text>
            <Text style={styles.mutedText}>
              Ready to order your favorite fast food?
            </Text>
          </View>

          {isGuest ? (
            <Pressable style={styles.signInPill} onPress={onProfilePress}>
              <Text style={styles.signInText}>Sign In</Text>
            </Pressable>
          ) : (
            <View style={styles.profileActions}>
              <Pressable style={styles.avatar} onPress={onProfilePress}>
                <Text style={styles.avatarText}>
                  {(name[0] || 'U').toUpperCase()}
                </Text>
              </Pressable>
              <Pressable onPress={onSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search food items..."
            style={styles.searchInput}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.overline}>CATEGORIES</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={styles.categoryItem}
              onPress={() => setCategory(cat)}
            >
              <View
                style={[
                  styles.categoryCircle,
                  category === cat && styles.categoryCircleActive,
                ]}
              >
                <Text style={styles.categoryEmoji}>
                  {CATEGORY_EMOJIS[cat as string] || '🍽️'}
                </Text>
              </View>

              <Text style={styles.categoryLabel}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.offerCard}>
          <View style={styles.offerTag}>
            <Text style={styles.offerTagText}>SPECIAL OFFER</Text>
          </View>

          <Text style={styles.offerTitle}>Offers For You</Text>

          <Text style={styles.offerText}>
            Spend over Rs. 1,500 on your first order and enjoy a special discount.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.overline}>FEATURED ITEMS</Text>

          <Pressable onPress={onCartPress} style={styles.cartBtn}>
            <Ionicons name="bag-outline" size={18} color="#35C989" />
            <Text style={styles.cartText}>{cartCount}</Text>
          </Pressable>
        </View>

        {filteredMenu.map((item) => (
          <Pressable
            key={item.id}
            style={styles.foodCard}
            onPress={() => onOpenItemDetail(item)}
          >
            <Image source={{ uri: item.image }} style={styles.foodImage} />

            <View style={styles.foodContent}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodDesc}>{item.description}</Text>

              <View style={styles.tagRow}>
                {item.tags.map((tag) => (
                  <Text key={tag} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>

              <Text style={styles.tinyText}>
                Suggested with: {item.pairingSuggestion}
              </Text>
            </View>

            <View style={styles.foodSide}>
              <Text style={styles.price}>{formatRs(item.price)}</Text>

              <Pressable
                style={styles.visualizeBtn}
                onPress={(event) => {
                  event.stopPropagation();
                  onOpenArLanding(item);
                }}
              >
                <Text style={styles.visualizeText}>Visualize</Text>
              </Pressable>

              <Pressable
                style={styles.addBtn}
                onPress={(event) => {
                  event.stopPropagation();
                  onOpenCustomizer(item);
                }}
              >
                <Ionicons name="add" size={20} color="#35C989" />
              </Pressable>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable style={styles.chatFab} onPress={onOpenChat}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}
