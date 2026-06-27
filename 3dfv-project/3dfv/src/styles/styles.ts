import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F1F3' },

  splash: {
    flex: 1,
    backgroundColor: '#F8F1F3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#35C989',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  splashTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#26232A',
  },

  bigTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#26232A',
  },

  splashOuterCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  splashMiddleCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  splashLogoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#35C989',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  splashTagline: {
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 24,
  },

  splashLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },

  splashLoadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8D8D8',
  },

  splashLoadingDotActive: {
    backgroundColor: '#35C989',
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  splashSub: {
    textAlign: 'center',
    color: '#777',
    fontSize: 15,
    marginTop: 6,
    marginBottom: 24,
  },

  primaryBtn: {
    backgroundColor: '#35C989',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  disabledBtn: { opacity: 0.5 },

  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  // ONBOARDING SCREENS
onboardingScreen: {
  flex: 1,
  backgroundColor: "#FFFFFF",
},

onboardingCard: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 34,
  paddingTop: 55,
  paddingBottom: 30,
},

onboardingImage: {
  width: "100%",
  height: 260,
  borderRadius: 22,
  resizeMode: "cover",
  marginBottom: 28,
  backgroundColor: "#F4F4F4",
},

dotsRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 28,
},

dot: {
  width: 7,
  height: 7,
  borderRadius: 4,
  backgroundColor: "#D8D8D8",
  marginRight: 6,
},

activeDot: {
  width: 18,
  height: 7,
  borderRadius: 8,
  backgroundColor: "#2D8CA3",
},

onboardingTitle: {
  fontSize: 25,
  fontWeight: "900",
  color: "#1E1E26",
  lineHeight: 32,
  marginBottom: 13,
},

onboardingText: {
  fontSize: 13,
  color: "#777777",
  lineHeight: 20,
  marginBottom: 20,
},

onboardingButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "auto",
},

skipButton: {
  paddingVertical: 14,
  paddingHorizontal: 8,
},

skipButtonText: {
  color: "#222222",
  fontSize: 14,
  fontWeight: "500",
},

nextButton: {
  backgroundColor: "#35C989",
  paddingVertical: 15,
  paddingHorizontal: 30,
  borderRadius: 14,
},

nextButtonText: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "800",
},

  centerText: {
    color: '#777',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },

  authWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  mutedText: {
    color: '#7C7780',
    fontSize: 13,
    lineHeight: 19,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#EEE8EA',
    padding: 5,
    borderRadius: 16,
    marginTop: 22,
    marginBottom: 16,
  },

  tab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 12,
  },

  activeTab: { backgroundColor: '#fff' },

  tabText: {
    color: '#777',
    fontWeight: '700',
  },

  activeTabText: { color: '#26232A' },

  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 14,
    fontSize: 15,
    color: '#222',
  },

  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginTop: 14,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#222',
  },

  googleBtn: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 14,
  },

  googleText: {
    color: '#333',
    fontWeight: '700',
  },

  adminHint: {
    color: '#35C989',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },

  pagePad: {
    padding: 18,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#26232A',
  },

  mapBox: {
    height: 180,
    borderRadius: 24,
    backgroundColor: '#E8FFF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 14,
  },

  mapText: {
    color: '#26232A',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
  },

  locationActive: {
    borderWidth: 2,
    borderColor: '#35C989',
  },

  locationText: {
    flex: 1,
    color: '#333',
    fontWeight: '700',
  },

  adminCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  adminCardText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#26232A',
  },

  emptyBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    marginTop: 14,
  },

  cartLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    marginTop: 12,
  },

  cartImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#eee',
  },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E7F8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  qtyText: { fontWeight: '900' },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  priceLabel: {
    color: '#777',
    fontSize: 15,
  },

  priceValue: {
    color: '#26232A',
    fontSize: 15,
  },

  boldText: {
    fontWeight: '900',
    fontSize: 18,
    color: '#26232A',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2DDE0',
    marginTop: 16,
  },

  checkoutCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginTop: 10,
    marginBottom: 12,
  },

  homeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  overline: {
    color: '#A3A0A5',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },

  locationMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },

  locationTitle: {
    fontSize: 15,
    color: '#3A3640',
    fontWeight: '800',
  },

  weatherPill: {
    backgroundColor: '#FFF0DC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  weatherText: {
    color: '#A86B24',
    fontWeight: '700',
    fontSize: 12,
  },

  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginTop: 26,
  },

  homeTitle: {
    color: '#26232A',
    fontWeight: '900',
    fontSize: 22,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#35C989',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 20,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginTop: 24,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 8,
    color: '#222',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
  },

  seeAll: {
    color: '#35C989',
    fontWeight: '800',
  },

  categoryItem: {
    alignItems: 'center',
    marginRight: 18,
  },

  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryCircleActive: { backgroundColor: '#35C989' },

  categoryEmoji: { fontSize: 22 },

  categoryLabel: {
    marginTop: 7,
    color: '#777',
    fontSize: 12,
    fontWeight: '700',
  },

  offerCard: {
    backgroundColor: '#37333A',
    padding: 18,
    borderRadius: 22,
    marginTop: 24,
  },

  offerTag: {
    backgroundColor: '#F4B93B',
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  offerTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },

  offerTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 20,
    marginTop: 12,
  },

  offerText: {
    color: '#DDD',
    marginTop: 8,
    lineHeight: 20,
  },

  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },

  cartText: {
    color: '#35C989',
    fontWeight: '900',
  },

  foodCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    marginTop: 14,
    gap: 12,
  },

  foodImage: {
    width: 84,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#eee',
  },

  foodContent: { flex: 1 },

  foodName: {
    color: '#26232A',
    fontSize: 15,
    fontWeight: '900',
  },

  foodDesc: {
    color: '#777',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },

  tag: {
    backgroundColor: '#F2ECEF',
    color: '#777',
    fontSize: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },

  tinyText: {
    color: '#999',
    fontSize: 11,
    marginTop: 5,
  },

  foodSide: {
    width: 78,
    alignItems: 'flex-end',
  },

  price: {
    color: '#26232A',
    fontWeight: '900',
    fontSize: 12,
    textAlign: 'right',
  },

  visualizeBtn: {
    backgroundColor: '#FFF0DC',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 10,
  },

  visualizeText: {
    color: '#A86B24',
    fontSize: 10,
    fontWeight: '900',
  },

  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E7F8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },

  chatFab: {
    position: 'absolute',
    right: 22,
    bottom: 34,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#35C989',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  modalCard: {
    backgroundColor: '#F8F1F3',
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  modalHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D5CFD2',
    marginBottom: 10,
  },

  sectionTitle: {
    color: '#26232A',
    fontWeight: '900',
    fontSize: 16,
    marginTop: 16,
  },

  portionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  portionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },

  portionActive: { backgroundColor: '#35C989' },

  portionText: {
    color: '#777',
    fontWeight: '800',
  },

  portionTextActive: { color: '#fff' },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },

  chatList: {
    padding: 18,
    gap: 10,
  },

  bubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 16,
  },

  aiBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },

  youBubble: {
    backgroundColor: '#35C989',
    alignSelf: 'flex-end',
  },

  aiBubbleText: { color: '#333' },

  youBubbleText: { color: '#fff' },

  chatInputRow: {
    flexDirection: 'row',
    padding: 14,
    gap: 10,
    backgroundColor: '#F8F1F3',
  },

  chatInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    color: '#222',
  },

  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#35C989',
    alignItems: 'center',
    justifyContent: 'center',
  },

  thanksScreen: {
  flex: 1,
  backgroundColor: '#F8F1F3',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
},

thanksCard: {
  width: '100%',
  backgroundColor: '#FFFFFF',
  borderRadius: 30,
  padding: 28,
  alignItems: 'center',
},

thanksIconCircle: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: '#35C989',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 22,
},

thanksTitle: {
  fontSize: 32,
  fontWeight: '900',
  color: '#26232A',
  textAlign: 'center',
},

thanksText: {
  fontSize: 16,
  color: '#777',
  textAlign: 'center',
  lineHeight: 24,
  marginTop: 12,
  marginBottom: 24,
},

thanksInfoBox: {
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  backgroundColor: '#E7F8EF',
  borderRadius: 18,
  padding: 16,
  marginBottom: 10,
},

thanksInfoTitle: {
  fontSize: 15,
  fontWeight: '900',
  color: '#26232A',
},

thanksInfoText: {
  fontSize: 13,
  color: '#777',
  lineHeight: 19,
  marginTop: 3,
},

});