const BASE_COLORS = {
  red: [211, 31, 53],
  blue: [44, 52, 128],
  yellow: [252, 215, 0],
  white: [255, 255, 255],
};
const MAXIMUM_DOT_SCALE = 80;

document.addEventListener("DOMContentLoaded", function () {
  let state = {
    targetColor: null,
    currentColor: null,
    currentMixedColors: [],
    currentLevel: 1,
  };

  const getColorPart = (colors, seed) => colors[Object.keys(colors).at(seed)];

  const rgbToString = (color) => `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

  const mixColors = (colors) => {
    const mix = Array.from({ length: colors.length }, (_, i) =>
      mixbox.rgbToLatent(colors[i])
    )
      .reduce((acc, curr) => (!acc ? curr : acc.map((c, i) => c + curr[i])))
      .map((c) => c / colors.length);

    return mixbox.latentToRgb(mix);
  };

  const createColor = (colors, partsCount) => {
    const parts = Array.from({ length: partsCount }, () =>
      getColorPart(
        colors,
        Math.floor(Math.random() * Object.keys(colors).length)
      )
    );

    return mixColors(parts);
  };

  const getDistance = (targetColor, mixedColor) => {
    const distance = Math.sqrt(
      Math.pow(targetColor[0] - mixedColor[0], 2) +
        Math.pow(targetColor[1] - mixedColor[1], 2) +
        Math.pow(targetColor[2] - mixedColor[2], 2)
    );
    const maxDistance = Math.sqrt(Math.pow(255, 2) * 3);

    return 100 - (distance / maxDistance) * 100;
  };

  const getMessageByDistance = (closenessPercentage) => {
    if (closenessPercentage >= 100) {
      return "Correct mix!";
    }

    if (closenessPercentage >= 99) {
      return `Almost! You are ${closenessPercentage.toFixed(
        2
      )}% close. Try again!`;
    }

    return `Incorrect mix. You are ${closenessPercentage.toFixed(
      2
    )}% close. Try again!`;
  };

  const addColor = (colors, color) => {
    return [...colors, color];
  };

  const updateState = (state, update) => ({
    ...state,
    currentColor: null,
    currentMixedColors: [],
    ...(update ? update : {}),
  });

  const updateUI = (state) => {
    resetcontainer.style.visibility = state.currentColor ? "visible" : "hidden";

    mixedColor.style.backgroundColor = state.currentColor
      ? rgbToString(state.currentColor)
      : "white";

    levelNumber.textContent = `Level ${state.currentLevel}`;

    targetColor.style.backgroundColor = rgbToString(state.targetColor);

    document.querySelectorAll("[data-color]").forEach((element) => {
      const color = element.dataset.color;

      window[`${color}Dot`].style.transform = `scale(${Math.min(
        MAXIMUM_DOT_SCALE,
        state.currentMixedColors.reduce(
          (acc, curr) =>
            BASE_COLORS[color].join() === curr.join() ? acc + 1 : acc,
          0
        )
      )})`;
    });

    return state;
  };

  const initializeGame = (state) => {
    document.querySelectorAll("[data-color]").forEach((element) => {
      const color = element.dataset.color;
      const rgb = BASE_COLORS[color];

      if (!rgb) return;

      element.previousElementSibling.style.backgroundColor = rgbToString(rgb);
    });

    return newRound(state);
  };

  const newRound = (state) => {
    const targetColor = createColor(BASE_COLORS, state.currentLevel);

    return updateUI(updateState(state, { targetColor }));
  };

  const getElementScale = (element) => {
    return parseFloat(
      element.style.transform.match(/scale\(([\d\.]+)\)/)?.at(1) ?? 1
    );
  };

  // LISTENERS

  reset.addEventListener("click", () => {
    state = updateUI(updateState(state));
  });

  check.addEventListener("click", () => {
    if (state.currentMixedColors.length === 0) return;

    const closenessPercentage = getDistance(
      state.targetColor,
      state.currentColor
    );

    nextColor.style.display = closenessPercentage >= 99 ? "inline" : "none";
    message.textContent = getMessageByDistance(closenessPercentage);

    dialog.showModal();
  });

  tryAgain.addEventListener("click", () => {
    state = updateUI(updateState(state));
  });

  changeColor.addEventListener("click", () => {
    state = newRound(updateState(state));
  });

  nextColor.addEventListener("click", () => {
    state = newRound(
      updateState(state, { currentLevel: state.currentLevel + 1 })
    );
  });

  document.querySelectorAll("[data-color]").forEach((element) =>
    element.addEventListener("click", (event) => {
      const color = event.target.dataset.color;

      const mixedColors = addColor(
        state.currentMixedColors,
        BASE_COLORS[color]
      );
      const mixedColor = mixColors(mixedColors);

      state = updateUI(
        updateState(state, {
          currentColor: mixedColor,
          currentMixedColors: mixedColors,
        })
      );
    })
  );

  state = initializeGame(state);
});
