export function parseWorkout(input) {
  const workoutData = [];
  const lines = input.split('\n').filter(line => line.trim());
  
  let currentRounds = 1;
  let roundsExercises = [];
  let inRoundBlock = false;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Check for rounds
    const roundMatch = line.match(/(\d+)\s+rounds?\s+of:?/i);
    if (roundMatch) {
      currentRounds = parseInt(roundMatch[1]);
      inRoundBlock = true;
      roundsExercises = [];
      continue;
    }

    // Parse exercise line
    const exercise = parseExerciseLine(line);
    if (exercise) {
      if (inRoundBlock) {
        roundsExercises.push(exercise);
      } else {
        workoutData.push(exercise);
      }
    }
  }

  // Add rounds exercises
  if (roundsExercises.length > 0) {
    for (let round = 1; round <= currentRounds; round++) {
      for (let exercise of roundsExercises) {
        workoutData.push({
          ...exercise,
          name: `R${round}: ${exercise.name}`
        });
      }
    }
  }

  return workoutData;
}

function parseExerciseLine(line) {
  // Remove leading dashes or bullets
  line = line.replace(/^[-•*]\s*/, '');
  
  // Various time formats
  const timePatterns = [
    /(\d+)\s*s(?:ec(?:ond)?s?)?/i,
    /(\d+)\s*m(?:in(?:ute)?s?)?/i,
    /(\d+):(\d+)/,
    /for\s+(\d+)\s*s(?:ec(?:ond)?s?)?/i,
    /for\s+(\d+)\s*m(?:in(?:ute)?s?)?/i,
    /(\d+)\s*s(?:ec(?:ond)?s?)?\s*of/i,
    /(\d+)\s*m(?:in(?:ute)?s?)?\s*of/i
  ];

  for (let pattern of timePatterns) {
    const match = line.match(pattern);
    if (match) {
      let seconds;
      if (match[2]) { // mm:ss format
        seconds = parseInt(match[1]) * 60 + parseInt(match[2]);
      } else if (pattern.source.includes('m(?:in')) { // minutes
        seconds = parseInt(match[1]) * 60;
      } else { // seconds
        seconds = parseInt(match[1]);
      }
      
      const name = line.replace(pattern, '').trim();
      return {
        name: name || 'Exercise',
        duration: seconds,
        type: name.toLowerCase().includes('rest') ? 'rest' : 'exercise'
      };
    }
  }

  return null;
}