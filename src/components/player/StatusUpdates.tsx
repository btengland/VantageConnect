import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomText from '../CustomText';

type Statuses = {
  heart: number;
  star: number;
  'timer-sand-full': number;
};

type StatusUpdatesProps = {
  statuses: Statuses;
  isEditable: boolean;
  onUpdate: (newStatuses: Statuses) => void;
};

const StatusUpdates = ({
  statuses,
  isEditable,
  onUpdate,
}: StatusUpdatesProps) => {
  const handleStatusChange = (
    status: keyof Statuses,
    change: number | 'set',
    value?: number,
  ) => {
    if (!isEditable) return;

    if (change === 'set' && value !== undefined) {
      onUpdate({ ...statuses, [status]: value });
    } else if (typeof change === 'number') {
      const currentLevel = statuses[status];
      const newLevel = Math.max(0, Math.min(6, currentLevel + change));
      onUpdate({ ...statuses, [status]: newLevel });
    }
  };

  return (
    <View style={{ marginTop: 16 }}>
      <CustomText style={styles.subHeader} small bold>
        Status Updates
      </CustomText>
      <View style={styles.statusContainer}>
        {(Object.keys(statuses) as (keyof Statuses)[]).map(status => (
          <View key={status} style={styles.statusRow}>
            <MaterialCommunityIcons name={status} size={30} color="black" />
            <View style={styles.statusTrack}>
              {[...Array(6)].map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleStatusChange(status, 'set', i + 1)}
                >
                  <View
                    style={[
                      styles.statusDot,
                      i < statuses[status] ? styles.statusDotFilled : {},
                    ]}
                  />
                </Pressable>
              ))}
            </View>
            <View style={styles.statusControls}>
              {isEditable && (
                <Pressable onPress={() => handleStatusChange(status, -1)}>
                  <MaterialCommunityIcons name="minus" size={30} color="black" />
                </Pressable>
              )}
              <CustomText style={styles.statusLevel}>
                {statuses[status]}
              </CustomText>
              {isEditable && (
                <Pressable onPress={() => handleStatusChange(status, 1)}>
                  <MaterialCommunityIcons name="plus" size={30} color="black" />
                </Pressable>
              )}
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
  statusContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  statusDotFilled: {
    backgroundColor: '#025472',
  },
  statusControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
});

export default StatusUpdates;
