import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import CustomText from '../CustomText';

type SkillToken = { id: string; quantity: number };

type SkillTokensProps = {
  skillTokens: SkillToken[];
  skillTokenIconMap: { [key: string]: any };
  isEditable: boolean;
  onUpdate: (newTokens: SkillToken[]) => void;
};

const SkillTokens = ({
  skillTokens,
  skillTokenIconMap,
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
    <View style={styles.sectionContainer}>
      <CustomText style={styles.subHeader} small bold>
        Skill Tokens
      </CustomText>
      <View style={styles.skillTokenGrid}>
        {skillTokens.map(token => (
          <View key={token.id} style={styles.skillTokenBox}>
            <View style={styles.iconBox}>
              <View style={styles.tokenContent}>
                <View style={styles.tokenIcon}>
                  <View style={styles.iconWrapper}>
                    <Image
                      source={skillTokenIconMap[token.id]}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <View style={styles.counterContainer}>
                  {isEditable && (
                    <Pressable
                      style={[
                        styles.tokenButton,
                        token.quantity === 0 && styles.tokenButtonDisabled,
                      ]}
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
    marginBottom: 12,
  },
  sectionContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  skillTokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skillTokenBox: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#d6d6d6',
    padding: 8,
    marginVertical: 4,
    borderRadius: 6,
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
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenButtonDisabled: {
    backgroundColor: '#666',
  },
  tokenButtonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default SkillTokens;
