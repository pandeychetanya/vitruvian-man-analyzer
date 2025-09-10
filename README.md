# ✨ Vitruvian Man Analyzer

*Created with passion by Chetanya Pandey*

Disclaimer: You're absolutely beautiful the way you're. Please don't let the AI's predictions stop you from smiling. I just tried it as a project to study 'perfect' shapes and designs, but please remember that the idea of 'perfect' is very idealistic. Having said that, welcome to a fascinating journey where Renaissance art meets cutting-edge AI! Do you wanna know how your pose compares to Leonardo da Vinci's iconic Vitruvian Man? Well, wonder no more! This delightful application takes your photos and reveals the hidden geometry within, measuring how closely you match the master's vision of perfect human proportions.

Imagine having a conversation with Leonardo himself about the divine mathematics of the human form - except instead of Italian, he speaks in Python and JavaScript! This project is where art history gets a high-tech makeover, combining the timeless beauty of classical proportions with the magic of modern computer vision.

## ✨ What Makes This Magical?


**The AI Artist's Eye**: Our digital assistant has been trained to see human bodies the way Renaissance masters did, detecting every curve, line, and proportion with the precision of a master sculptor's chisel.

**Your Personal Proportion Prophet**: Upload any photo and watch as ancient mathematical principles come alive, revealing the hidden geometry that da Vinci believed made us perfectly human.

**A Canvas of Code**: Every analysis paints a picture of your unique proportions, creating a beautiful dance between your individuality and classical ideals.

**Interactive Wonder**: No complex software to install - just open your browser and step into a world where art and technology shake hands and create something beautiful together.

## 🎨 The Magic Behind the Curtain

Ever curious about how this digital sorcery works? Let me pull back the curtain and show you the beautiful symphony of code that makes it all possible!

**The Brain** (`vitruvian_analyzer.py`): This is where all the mathematical wizardry happens! It's like having a Renaissance scholar who's also a computer vision expert, carefully measuring every pixel and proportion with the dedication of a monk illuminating manuscripts.

**The Heart** (`app.py`): Our Flask-powered web application that serves as the welcoming host, graciously accepting your images and presenting the results with the flourish of a Renaissance court presenter.

**The Face** (Web Frontend): The beautiful interface that greets you with warm colors and intuitive design, making the complex world of proportional analysis feel as natural as sketching in a sunny Italian piazza.

### The Talented Cast of Technologies

Think of this as an artistic collaboration across centuries! We've assembled quite the ensemble:

**Python & Flask**: The steady foundation, like the marble base of Michelangelo's David, providing structure and reliability while staying elegantly simple.

**MediaPipe**: Google's gift to computer vision, acting as our digital eye that can see human poses with almost supernatural precision.

**OpenCV**: The master image craftsman, handling pixels like a Renaissance painter handles pigments.

**HTML, CSS, & JavaScript**: The trio that brings beauty to the web, creating an interface that would make da Vinci proud of how art and function dance together.

## 🔍 The Renaissance Detective Work

Here's where things get really exciting! Our digital detective carefully examines your photo with the same attention to detail that Leonardo used when studying human anatomy (though thankfully, much less messy than his actual dissections!).

### The Golden Measurements

Just like da Vinci had his secret notebook filled with observations about perfect proportions, our analyzer looks for these timeless relationships:

**The Head Game**: Leonardo discovered that in perfect proportions, your head should be exactly one-eighth of your total height. It's like nature's own measuring stick built right into your body!

**The Great Stretch**: Here's the famous one - when you spread your arms wide like you're giving the world the biggest hug, that span should exactly equal your height. It's geometry made human!

**The Torso Tale**: Your upper body tells its own story of proportion, creating the perfect balance between your head and your legs.

**The Foundation**: Your legs aren't just for walking - they're architectural columns that complete the divine proportion puzzle.

### The Symmetry Symphony

But wait, there's more! Our analyzer also plays the role of a balance detective, checking how well your left and right sides mirror each other. It's like having a perfectionist artist ensure that both sides of a masterpiece are harmoniously aligned.

The app also sees if you fit nicely within a square (just like da Vinci's famous drawing) and finds your body's natural center point - the spot around which all your proportions dance.

### The Final Flourish

All these measurements waltz together to create your personal Vitruvian score from 0 to 100. Think of it as getting a report card from Leonardo himself, with each element of your proportions contributing to the final grade. Don't worry though - this isn't about being "perfect," it's about celebrating the beautiful mathematics that make you uniquely human!

## 🚀 Ready to Start Your Renaissance Adventure?

Getting started is easier than learning to paint the Mona Lisa! Here's your quick journey from curious explorer to proportion detective:

### What You'll Need

Just a couple of things to begin this magical journey:
- Python 3.8 or newer (think of it as your artistic canvas)
- pip (your trusty paint brush for installing tools)

### Let the Magic Begin!

**Step 1: Bring the Project Home**
```bash
git clone https://github.com/chetanyapandey/vitruvian-man-analyzer.git
cd vitruvian-man-analyzer
```
*Like inviting a Renaissance master into your digital studio!*

**Step 2: Gather Your Tools**
```bash
pip install -r requirements.txt
```
*This is like mixing your paints and preparing your brushes - all the AI magic ingredients coming together!*

**Step 3: Breathe Life into Your Creation**
```bash
python app.py
```
*Watch as your local computer transforms into a Renaissance workshop!*

**Step 4: Open the Gallery Doors**
Navigate to `http://localhost:5000` in your favorite browser, and voilà! You're ready to discover the hidden geometry in any photograph.

## 🎭 Time to Play!

### The Grand Theater Experience

Picture this: you're about to step onto a digital stage where you're both the artist and the subject! Here's how the magic unfolds:

**Act I**: Open your browser and visit the beautiful interface - it's like walking into a modern art gallery that happens to understand Renaissance mathematics.

**Act II**: Choose a photo of yourself or anyone striking a pose (full body shots with arms extended work best - think "I'm flying!" or "Ta-da!" poses).

**Act III**: Watch in wonder as our AI detective gets to work, measuring and calculating with the precision of a master craftsman.

**The Grand Finale**: Marvel at your results! You'll see your personal Vitruvian score, beautiful visualizations of your proportions, and a detailed analysis that reads like a love letter from Leonardo himself.

### For the Command Line Artists

Prefer working behind the scenes? You can run the analyzer directly like a true Renaissance engineer:

```bash
python vitruvian_analyzer.py your_amazing_photo.jpg --verbose
```

Want to save your masterpiece analysis? Add `--output results.json` and keep your proportional poetry forever!

### The Developer's Secret Passage

Building something even more amazing? Our Flask app has a friendly API that speaks JSON:

```bash
curl -X POST -F "image=@your_photo.jpg" http://localhost:5000/api/analyze
```

It's like having a Renaissance consultant available 24/7 for all your proportion analysis needs!

## 🏛️ The Architecture of Wonder

Ever peeked inside a Renaissance workshop? Here's how our digital atelier is organized:

```
vitruvian-man-analyzer/
├── vitruvian_analyzer.py      ✨ The mastermind - where all the AI magic happens
├── app.py                     🌟 The gracious host - welcoming your images with Flask charm
├── requirements.txt           📜 The ingredient list - all the tools we need for magic
├── README.md                  📖 This very story you're reading!
├── templates/
│   └── index.html            🎨 The beautiful face - your gateway to proportion analysis  
├── static/
│   ├── css/
│   │   └── style.css         💫 The stylist - making everything gorgeous
│   └── js/
│       └── main.js           ⚡ The choreographer - orchestrating the web experience
└── uploads/                  📸 The temporary gallery - where your photos briefly rest
```

Each file plays its part in this symphony of code, working together like apprentices in Leonardo's workshop!

## 🎨 A Love Letter to Leonardo

Let's take a moment to appreciate the star of our show! Leonardo da Vinci's Vitruvian Man, created around 1490, isn't just a drawing - it's a love letter to human perfection. Picture this: Leonardo, quill in hand, candlelight flickering, discovering that the human body contains its own divine mathematics.

This famous figure shows us something magical - when you stretch your arms wide and stand tall, you create perfect geometry. Your body fits snugly within both a circle and a square, like nature's own architectural blueprint. It's as if the universe whispered its secrets to Leonardo, and he shared them with the world through this iconic sketch.

The genius lies in the details: your arm span equals your height, your head measures exactly one-eighth of your total height, and everything balances in perfect harmony. It's not just art - it's mathematics made flesh, geometry made human.

## 🔮 The Technical Sorcery

Curious about the wizardry behind the curtain? Our digital Leonardo uses some pretty incredible modern magic:

**The All-Seeing Eye**: Google's MediaPipe framework acts as our supernatural vision, spotting 33 different points on the human body with the precision of a Renaissance master's trained eye.

**The Mathematical Mind**: Every measurement comes from good old-fashioned Euclidean geometry - the same math that fascinated ancient Greeks and inspired Leonardo. We calculate distances, ratios, and symmetries using formulas that would make Pythagoras proud.

**The Wisdom of Proportions**: Just like Leonardo studied countless bodies to understand divine proportions, our AI has been trained to recognize these timeless relationships in any photograph.

## 🌟 Where Magic Meets Reality

This isn't just a fun toy (though it is incredibly fun!) - it's a bridge connecting art, science, and technology in ways that would make Leonardo himself absolutely giddy with excitement:

**For Artists and Educators**: Bring classical proportions to life in classrooms and studios, making ancient wisdom accessible to modern minds.

**For Fitness Enthusiasts**: Discover the mathematical beauty in human movement and posture.

**For Curious Minds**: Explore the intersection of art history, mathematics, and cutting-edge AI.

**For Developers**: Use our API to build even more amazing applications that celebrate human proportions.

## 🚀 Join the Renaissance!

This project is just the beginning of something beautiful! Whether you want to improve the AI, add new features, or just share ideas, you're welcome to join this digital Renaissance. 

After all, Leonardo himself was all about collaboration, experimentation, and pushing boundaries. Let's continue that tradition!

## 💝 With Gratitude

This project exists because of giants who came before us:
- Leonardo da Vinci, for showing us that art and science are dance partners
- The brilliant minds at Google who gifted us MediaPipe
- Every open source contributor who believes in sharing knowledge freely

*Built with curiosity, wonder, and a deep appreciation for the mathematics of beauty.*

**Created by Chetanya Pandey**  
*A humble student of both Renaissance masters and modern technology*
