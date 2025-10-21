import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import CustomText from '../CustomText';

type SkillToken = { id: string; quantity: number };

type SkillTokensProps = {
  skillTokens: SkillToken[];
  skillTokenIcons: any[];
  isEditable: boolean;
  onUpdate: (newTokens: SkillToken[]) => void;
};

const SkillTokens = ({
  skillTokens,
  skillTokenIcons,
  isEditable,
  onUpdate,
}: SkillTokensProps) => {
  const handleTokenChange = (id: string, delta: number) => {
    if (!isEditable) return;
    const newTokens = skillTokens.map(token =>
      token.id === id
        ? { ...token, quantity: Math.max(0, token.quantity + delta) }
        : token,
    );
    onUpdate(newTokens);
  };

  return (
    <View style={{ marginTop: 16 }}>
      <CustomText style={styles.subHeader} small bold>
        Skill Tokens
      </CustomText>
      <View style={styles.skillTokenGrid}>
        {skillTokens.map((token, index) => (
          <View key={token.id} style={styles.skillTokenBox}>
            <View style={styles.iconBox}>
              <View style={styles.tokenContent}>
                <View style={styles.tokenIcon}>
                  <View style={styles.iconWrapper}>
                    <Image
                      source={skillTokenIcons[index]}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <View style={styles.counterContainer}>
                  {isEditable && (
                    <Pressable
                      style={styles.tokenButton}
                      onPress={() => handleTokenChange(token.id, -1)}
                    >
                      <CustomText style={styles.tokenButtonText}>-</CustomText>
                    </Pressable>
                  )}
                  <CustomText style={styles.tokenQuantity}>
                    {token.quantity}
                  </CustomText>
                  {isEditable && (
                    <Pressable
                      style={styles.tokenButton}
                      onPress={() => handleTokenChange(token.id, 1)}
                    >
                      <CustomText style={styles.tokenButtonText}>+</CustomText>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subHeader: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 6,
  },
  skillTokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skillTokenBox: {
    width: '48%',
    backgroundColor: '#eee',
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  iconBox: {
    width: '100%',
    alignItems: 'center',
  },
  tokenContent: {
    flex: 1,
    alignItems: 'center',
  },
  tokenIcon: {
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrapper: {
    width: 30,
    height: 30,
  },
  tokenQuantity: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  tokenButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenButtonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default SkillTokens;
