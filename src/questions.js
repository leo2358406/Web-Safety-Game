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
    hint: "Look back at the phone. Who showed up on the map after you passed through the Ad Network zone?",
    why: "Location history reveals where you live, work and go. If it's shared or sold, strangers can use it.",
  },
  {
    id: "permissions",
    scene: "PermissionsLevel",
    prompt: "Which of the following options can assist you in protecting your privacy?",
    choices: [
      "Reviewing and limiting which permissions each app has",
      "Allowing every app to access your location, just in case",
      "Using the same simple password for all your accounts",
      "Accepting all cookies without reading what they do",
    ],
    answer: 0,
    hint: "Think about what finally stopped the red data streams in the room.",
    why: "Every permission you switch off closes a door apps could use to collect your data.",
  },
  {
    id: "nda",
    scene: "NdaLevel",
    prompt:
      "You signed a contract before seeing Project Nova. What is the purpose of a non-disclosure agreement?",
    choices: [
      "To legally require you to keep certain information confidential",
      "To let you share company secrets with close friends",
      "To protect your computer from viruses",
      "To give you ownership of the company's ideas",
    ],
    answer: 0,
    hint: "Why couldn't you tell Sam about the prototype?",
    why: "An NDA is a legal promise not to share specific private information with other people.",
  },
  {
    id: "not-a-concern",
    scene: "ThreatLevel",
    prompt: "Which of the following is NOT a concern when trying to protect your privacy on the Internet?",
    choices: [
      "Using open public Wi-Fi without protection",
      "Clicking links from people you don't know",
      "Posting your address and daily schedule publicly",
      "Installing the latest security updates",
    ],
    answer: 3,
    hint: "Which station turned green instead of red?",
    why: "Security updates fix known holes, so installing them protects your privacy instead of risking it.",
  },
  {
    id: "password-reuse",
    scene: "PasswordLevel",
    prompt: "Why is using the same password for every account risky?",
    choices: [
      "If one site is breached, attackers can try that password on your other accounts",
      "It makes your devices run slower",
      "Websites lock you out for using it too often",
      "It isn't risky as long as you never share it",
    ],
    answer: 0,
    hint: "Remember what the hacker did after the shop was breached.",
    why: "One leaked password lets attackers try it everywhere. Use a different password for each account.",
  },
];