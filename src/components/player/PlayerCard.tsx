import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { debounce } from 'lodash';
import CustomText from '../CustomText';
import { lightenColor } from '../../utils';
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
  const isEditable = currentPlayerId === player.id;
  const { updatePlayer } = usePlayerStore();

  const [name, setName]          = useState(player.name);
  const [location, setLocation]    = useState(player.location);
  const [journalText, setJournalText] = useState(player.journalText);
  const focusedInputRef         = useRef<string | null>(null);

  const debouncedUpdatePlayer = useCallback(
    debounce((updates: Partial<Player>) => {
      onUpdatePlayer(updates);
    }, 500),
    [onUpdatePlayer],
  );

  useEffect(() => {
    if (focusedInputRef.current !== 'name') setName(player.name);
    if (focusedInputRef.current !== 'location') setLocation(player.location);
    if (focusedInputRef.current !== 'journalText')
      setJournalText(player.journalText);
  }, [player.name, player.location, player.journalText]);

  const handleLocalUpdate = (updates: Partial<Player>) => {
    updatePlayer(player.id, updates);
    debouncedUpdatePlayer(updates);
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
            player={player}
            totalPlayers={totalPlayers}
            onNameChange={text => {
              setName(text);
              handleLocalUpdate({ name: text });
            }}
            onCharacterChange={val => handleLocalUpdate({ character: val })}
            onEscapePodChange={val => handleLocalUpdate({ escapePod: val })}
            onFocus={field => (focusedInputRef.current = field)}
            onBlur={() => (focusedInputRef.current = null)}
          />

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
            onUpdate={newSlots =>
              handleLocalUpdate({ impactDiceSlots: newSlots })
            }
          />

          <StatusUpdates
            statuses={player.statuses}
            isEditable={isEditable}
            onUpdate={newStatuses =>
              handleLocalUpdate({ statuses: newStatuses })
            }
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
});

export default React.memo(PlayerCard);
