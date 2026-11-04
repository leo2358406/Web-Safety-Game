const LEVELS = [
  {
    id: "gps-tracking",
    scene: "NavigationLevel",
    prompt:
      "Applications that record your location, using GPS, are common. Which of the following is a legitimate concern when using these apps?",
    choices: [
      "The app will make your phone screen dimmer",
      "Your location history could be sold or accessed by someone you don't know",
      "GPS only works when you walk in a straight line",
      "Location data can't tell anyone anything about you",
    ],
    answer: 1,
    hint: "Look back at the phone. Who showed up on the map after you walked past the Ad Network?",
    why: "Location history reveals where you live, work and go. If it's shared or sold, strangers can use it.",
  },
];