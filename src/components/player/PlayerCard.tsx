import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { debounce } from 'lodash';
import { SharedStyles } from '../SharedStyles';
import CustomText from '../CustomText';
import { lightenColor } from '../../utils';
import { endTurn } from '../../api';
import SkillTokens from './SkillTokens';
import StatusUpdates from './StatusUpdates';
import PlayerHeader from './PlayerHeader';
import PlayerLocation from './PlayerLocation';
import PlayerImpactDice from './PlayerImpactDice';
import PlayerJournal from './PlayerJournal';
import { usePlayerStore, Player } from '../../store/playerStore';

type PlayerCardProps = {
  currentPlayerId: number;
  player: Player;
  getCharacterColor: (characterText: string) => string;
  skillTokenIcons: any[];
  onUpdatePlayer: (updates: Partial<Player>) => void;
  totalPlayers: number;
};

function PlayerCard({
  currentPlayerId,
  player,
  getCharacterColor,
  skillTokenIcons,
  onUpdatePlayer,
  totalPlayers,
}: PlayerCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditable = currentPlayerId === player.id;
  const { updatePlayer } = usePlayerStore();

  // Local state for text inputs to avoid re-renders on every keystroke
  const [name, setName] = useState(player.name);
  const [location, setLocation] = useState(player.location);
  const [journalText, setJournalText] = useState(player.journalText);
  const focusedInputRef = useRef<string | null>(null);

  // Debounced update function
  const debouncedUpdatePlayer = useCallback(
    debounce((updates: Partial<Player>) => {
      onUpdatePlayer(updates); // This will call the API
    }, 500),
    [onUpdatePlayer],
  );

  // Sync incoming player prop with local state, but NOT if user is editing
  useEffect(() => {
    if (focusedInputRef.current !== 'name') setName(player.name);
    if (focusedInputRef.current !== 'location') setLocation(player.location);
    if (focusedInputRef.current !== 'journalText')
      setJournalText(player.journalText);
  }, [player.name, player.location, player.journalText]);

  const handleLocalUpdate = (updates: Partial<Player>) => {
    // Update the store immediately for UI responsiveness
    updatePlayer(player.id, updates);
    // Debounce the API call
    debouncedUpdatePlayer(updates);
  };

  // Reset loading state when it becomes this player's turn again
  useEffect(() => {
    if (player.turn) setIsLoading(false);
  }, [player.turn]);

  const handleEndTurn = async () => {
    if (!isEditable || isLoading) return;
    setIsLoading(true);
    try {
      await endTurn(player.sessionCode, player.id);
    } catch (err) {
      console.error('End turn failed', err);
      setIsLoading(false);
    }
  };

  const lighterBg = lightenColor(getCharacterColor(player.character), 0.8);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={150}
    >
      <View style={styles.cardContainer}>
        <ScrollView
          contentContainerStyle={[styles.card, { backgroundColor: lighterBg }]}
        >
          <PlayerHeader
            isEditable={isEditable}
            name={name}
            character={player.character}
            escapePod={player.escapePod}
            playerNumber={player.playerNumber}
            onNameChange={text => {
              setName(text);
              handleLocalUpdate({ name: text });
            }}
            onCharacterChange={val => handleLocalUpdate({ character: val })}
            onEscapePodChange={val => handleLocalUpdate({ escapePod: val })}
            onFocus={field => (focusedInputRef.current = field)}
            onBlur={() => (focusedInputRef.current = null)}
          />

          {player.turn && player.id === currentPlayerId && (
            <View style={styles.buttonContainer}>
              <View style={[styles.turnTextContainer, styles.myTurnBackground]}>
                <CustomText style={styles.turnText} small bold>
                  It's your turn
                </CustomText>
              </View>
              <Pressable
                disabled={isLoading || totalPlayers <= 1}
                onPress={handleEndTurn}
                style={({ pressed }) => [
                  {
                    opacity:
                      pressed || isLoading || totalPlayers <= 1 ? 0.5 : 1,
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <CustomText
                    style={totalPlayers > 1 && SharedStyles.button}
                    small
                    bold
                  >
                    Done
                  </CustomText>
                )}
              </Pressable>
            </View>
          )}

          <PlayerLocation
            isEditable={isEditable}
            location={location}
            lighterBg={lighterBg}
            onLocationChange={text => {
              setLocation(text);
              handleLocalUpdate({ location: text });
            }}
            onFocus={field => (focusedInputRef.current = field)}
            onBlur={() => (focusedInputRef.current = null)}
          />

          <SkillTokens
            skillTokens={player.skillTokens}
            skillTokenIcons={skillTokenIcons}
            isEditable={isEditable}
            onUpdate={newTokens => handleLocalUpdate({ skillTokens: newTokens })}
          />

          <PlayerImpactDice
            isEditable={isEditable}
            impactDiceSlots={player.impactDiceSlots}
            onUpdate={newSlots => handleLocalUpdate({ impactDiceSlots: newSlots })}
          />

          <StatusUpdates
            statuses={player.statuses}
            isEditable={isEditable}
            onUpdate={newStatuses => handleLocalUpdate({ statuses: newStatuses })}
          />

          <PlayerJournal
            isEditable={isEditable}
            journalText={journalText}
            onJournalChange={text => {
              setJournalText(text);
              handleLocalUpdate({ journalText: text });
            }}
            onFocus={field => (focusedInputRef.current = field)}
            onBlur={() => (focusedInputRef.current = null)}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    flex: 1,
  },
  card: {
    padding: 24,
    backgroundColor: 'white',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#eee',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
  },
  turnTextContainer: {
    backgroundColor: '#f0f4f8',
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: '60%',
  },
  myTurnBackground: {
    backgroundColor: '#a5f0a8',
  },
  turnText: {
    textAlign: 'center',
  },
});

export default React.memo(PlayerCard);
