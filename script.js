document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    const books = [
        { id: 1, title: "The Midnight Library", author: "Matt Haig", moods: ['thought-provoking', 'hopeful'], genre: "Fantasy Fiction", teaser: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.", cover: "https://placehold.co/400x600/1E293B/FFFFFF?text=The+Midnight\nLibrary", downloadLink: "#" },
        { id: 2, title: "Project Hail Mary", author: "Andy Weir", moods: ['adventurous', 'humorous', 'sci-fi'], genre: "Science Fiction", teaser: "A lone astronaut awakens on a mission to save humanity, with no memory of who he is or how he got there. His only companions are two corpses... and a friendly alien.", cover: "https://placehold.co/400x600/4F46E5/FFFFFF?text=Project\nHail+Mary", downloadLink: "#" },
        { id: 3, title: "The Silent Patient", author: "Alex Michaelides", moods: ['mysterious', 'suspenseful'], genre: "Thriller", teaser: "A famous painter shoots her husband and then never speaks another word. A psychotherapist is determined to unravel the mystery of her silence.", cover: "https://placehold.co/400x600/DC2626/FFFFFF?text=The+Silent\nPatient", downloadLink: "#" },
        { id: 4, title: "Circe", author: "Madeline Miller", moods: ['mythological', 'empowering', 'fantasy'], genre: "Fantasy", teaser: "Born in the house of Helios, a strange child, neither powerful like her father nor alluring like her mother, discovers she possesses the power of witchcraft.", cover: "https://placehold.co/400x600/F59E0B/FFFFFF?text=Circe", downloadLink: "#" },
        { id: 5, title: "Pride and Prejudice", author: "Jane Austen", moods: ['romantic', 'classic'], genre: "Classic Romance", teaser: "A story of the five Bennet sisters in Georgian England, as they navigate issues of marriage, morality, and misconceptions. It is a truth universally acknowledged...", cover: "https://placehold.co/400x600/EC4899/FFFFFF?text=Pride+and\nPrejudice", downloadLink: "#" },
        { id: 6, title: "Dune", author: "Frank Herbert", moods: ['epic', 'sci-fi', 'adventurous'], genre: "Science Fiction", teaser: "Set on a desert planet, a noble family is thrust into a war for control of the most valuable asset in the galaxy: a spice that extends life and enhances consciousness.", cover: "https://placehold.co/400x600/D97706/FFFFFF?text=Dune", downloadLink: "#" },
        { id: 7, title: "The Song of Achilles", author: "Madeline Miller", moods: ['romantic', 'heartbreaking', 'mythological', 'tragedy'], genre: "Historical Fiction", teaser: "An exiled prince forms an inseparable bond with the golden hero Achilles. As the Trojan War looms, they are tested by fate, gods, and their own hearts.", cover: "https://placehold.co/400x600/3B82F6/FFFFFF?text=The+Song+of\nAchilles", downloadLink: "#" },
        { id: 8, title: "Educated", author: "Tara Westover", moods: ['inspiring', 'thought-provoking'], genre: "Memoir", teaser: "A young girl, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University, discovering the transformative power of education.", cover: "https://placehold.co/400x600/10B981/FFFFFF?text=Educated", downloadLink: "#" },
        { id: 9, title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", moods: ['dramatic', 'romantic', 'drama'], genre: "Historical Fiction", teaser: "A reclusive Old Hollywood movie icon decides to give a final interview to an unknown magazine reporter, revealing the secrets of her glamorous and scandalous life.", cover: "https://placehold.co/400x600/8B5CF6/FFFFFF?text=Evelyn\nHugo", downloadLink: "#" },
        { id: 10, title: "A Man Called Ove", author: "Fredrik Backman", moods: ['humorous', 'heartwarming', 'hopeful'], genre: "Contemporary Fiction", teaser: "He's a curmudgeon with strict principles and a short fuse. But behind the cranky exterior is a story of love and loss, and his life is about to be turned upside down by a boisterous young family.", cover: "https://placehold.co/400x600/6366F1/FFFFFF?text=A+Man\nCalled+Ove", downloadLink: "#" },
        { id: 11, title: "Gone Girl", author: "Gillian Flynn", moods: ['suspenseful', 'mysterious'], genre: "Thriller", teaser: "On the day of their fifth wedding anniversary, a woman disappears. Her husband becomes the prime suspect, but the truth is far more twisted than anyone can imagine.", cover: "https://placehold.co/400x600/4B5563/FFFFFF?text=Gone\nGirl", downloadLink: "#" },
        { id: 12, title: "Atomic Habits", author: "James Clear", moods: ['inspiring', 'self-help'], genre: "Non-Fiction", teaser: "An easy and proven way to build good habits and break bad ones. Learn how tiny changes can lead to remarkable results over time.", cover: "https://placehold.co/400x600/EF4444/FFFFFF?text=Atomic\nHabits", downloadLink: "#" },
        { id: 13, title: "It", author: "Stephen King", moods: ['scary', 'suspenseful'], genre: "Horror", teaser: "Seven children in a small town are terrorized by an evil entity that preys on their worst fears, clowning around in the sewers.", cover: "https://placehold.co/400x600/C2410C/FFFFFF?text=It", downloadLink: "#" },
        { id: 14, title: "Haunting Adeline", author: "H.D. Carlton", moods: ['dark romance', 'suspenseful', 'sexy'], genre: "Dark Romance", teaser: "A woman moves into her family's old manor and discovers the journals of her great-grandmother, who was stalked by a mysterious man. Soon, she finds herself the object of a new obsession.", cover: "https://placehold.co/400x600/171717/FFFFFF?text=Haunting\nAdeline", downloadLink: "#" },
        { id: 15, title: "Red, White & Royal Blue", author: "Casey McQuiston", moods: ['romantic', 'humorous', 'bl romance'], genre: "Contemporary Romance", teaser: "America's First Son falls in love with a British prince, and their secret relationship could upend two nations and begs the question: can love save the world?", cover: "https://placehold.co/400x600/3B82F6/FFFFFF?text=Red,+White\n&+Royal+Blue", downloadLink: "#" },
        { id: 16, title: "The Hobbit", author: "J.R.R. Tolkien", moods: ['adventurous', 'fantasy'], genre: "Fantasy", teaser: "A comfortable hobbit is swept into an epic quest to reclaim a stolen treasure from a fearsome dragon, alongside a company of dwarves.", cover: "https://placehold.co/400x600/16A34A/FFFFFF?text=The+Hobbit", downloadLink: "#"}
    ];
    
    const moods = [
        { name: 'Adventurous', icon: 'compass', color: 'bg-orange-500' },
        { name: 'Romantic', icon: 'heart', color: 'bg-rose-500' },
        { name: 'Mysterious', icon: 'puzzle', color: 'bg-indigo-500' },
        { name: 'Suspenseful', icon: 'hourglass', color: 'bg-red-600' },
        { name: 'Humorous', icon: 'laugh', color: 'bg-yellow-500' },
        { name: 'Hopeful', icon: 'sunrise', color: 'bg-sky-500' },
        { name: 'Heartbreaking', icon: 'cloud-rain', color: 'bg-slate-500' },
        { name: 'Inspiring', icon: 'award', color: 'bg-emerald-500' },
        { name: 'Thought-provoking', icon: 'brain-circuit', color: 'bg-purple-500' },
        { name: 'Sci-Fi', icon: 'rocket', color: 'bg-cyan-500' },
        { name: 'Scary', icon: 'ghost', color: 'bg-zinc-800' },
        { name: 'Dark Romance', icon: 'heart-crack', color: 'bg-rose-900' },
        { name: 'Sexy', icon: 'flame', color: 'bg-red-700' },
        { name: 'BL Romance', icon: 'link', color: 'bg-sky-400' },
        { name: 'GL Romance', icon: 'link', color: 'bg-rose-400' },
        { name: 'Drama', icon: 'theater', color: 'bg-purple-600' },
        { name: 'Tragedy', icon: 'skull', color: 'bg-slate-600' },
        { name: 'Fantasy', icon: 'sparkles', color: 'bg-teal-500' }
    ];

    // Load story from localStorage or use default
    let storyChain = JSON.parse(localStorage.getItem('storyChain')) || [
        "The old lighthouse stood on the cliff's edge, its lamp dark for the first time in a century.",
        "A small, leather-bound book appeared on its doorstep with the morning fog, holding a single, cryptic sentence inside.",
        "'The sea remembers what the land forgets,' it read, in a script that seemed to shift before the reader's eyes."
    ];

    let currentMoodBook = null;
    let currentSelectedMood = '';

    // --- GEMINI API INTEGRATION ---
    // IMPORTANT: To use the AI feature, you must get your own API key from Google AI Studio
    // and paste it here. For security, it's best to use a backend to handle API keys.
    const API_KEY = ""; // PASTE YOUR GOOGLE GEMINI API KEY HERE
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    async function callGeminiAPI(payload, retries = 3, delay = 1000) {
        if (!API_KEY) {
            alert("API Key is missing. Please add your Gemini API key to script.js to use the AI feature.");
            return null;
        }

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                const candidate = result.candidates?.[0];
                if (candidate && candidate.content?.parts?.[0]?.text) {
                    return candidate.content.parts[0].text;
                } else {
                    throw new Error("Invalid response structure from API.");
                }
            } catch (error) {
                console.error(`API call attempt ${i + 1} failed:`, error);
                if (i === retries - 1) {
                    return null; // Failed after all retries
                }
                await new Promise(res => setTimeout(res, delay * Math.pow(2, i))); // Exponential backoff
            }
        }
    }


    // --- NAVIGATION ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    const setActiveSection = (sectionId) => {
        sections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });
        window.scrollTo(0,0);
         if (!mobileMenu.classList.contains('hidden')) {
             mobileMenu.classList.add('hidden');
         }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveSection(e.target.dataset.section);
        });
    });

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });


    // --- MOOD DISCOVERY ---
    const moodSelector = document.getElementById('mood-selector');
    const moodBookSuggestion = document.getElementById('mood-book-suggestion');
    const moodBookCard = document.getElementById('mood-book-card');
    
    function initMoods() {
        moods.forEach(mood => {
            const moodCard = document.createElement('button');
            moodCard.className = `mood-card ${mood.color} text-white p-6 rounded-lg shadow-lg cursor-pointer flex flex-col items-center justify-center text-center`;
            moodCard.dataset.mood = mood.name.toLowerCase();
            moodCard.innerHTML = `
                <i data-lucide="${mood.icon}" class="w-12 h-12 mb-3"></i>
                <span class="text-xl font-semibold">${mood.name}</span>
            `;
            moodSelector.appendChild(moodCard);
            moodCard.addEventListener('click', () => handleMoodSelection(mood.name.toLowerCase()));
        });
        lucide.createIcons();
    }

    function handleMoodSelection(mood) {
        currentSelectedMood = mood;
        const possibleBooks = books.filter(book => book.moods.includes(mood));
        if (possibleBooks.length > 0) {
            currentMoodBook = possibleBooks[Math.floor(Math.random() * possibleBooks.length)];
            displayMoodBookTeaser();
        } else {
            // Fallback to a random book if no book for the selected mood is found
            currentMoodBook = books[Math.floor(Math.random() * books.length)];
            displayMoodBookTeaser();
        }
    }
    
    function displayMoodBookTeaser(isLoading = false, loadingText = "Finding a book...") {
          moodBookSuggestion.classList.remove('hidden');
          moodBookCard.classList.remove('revealed');

          const frontCard = document.querySelector('.flip-card-front');
          if (isLoading) {
              frontCard.innerHTML = `
                  <div class="flex flex-col items-center justify-center h-full">
                      <div class="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[#f7b267] mb-4"></div>
                      <p class="text-lg text-[#f7b267]">${loadingText}</p>
                  </div>
              `;
          } else {
              frontCard.innerHTML = `
                  <div class="w-full">
                      <div class="flex justify-center mb-4"><i data-lucide="gift" class="w-16 h-16 text-[#f7b267]"></i></div>
                      <h4 class="text-xl font-semibold mb-2" id="mood-book-teaser-genre">A ${currentMoodBook.genre} novel...</h4>
                      <p class="text-gray-300 italic" id="mood-book-teaser-blurb">"${currentMoodBook.teaser}"</p>
                  </div>
                  <p class="text-sm text-gray-500">Click "Reveal Book" to unwrap your surprise!</p>
              `;
              lucide.createIcons();
          }

          document.getElementById('mood-reveal-controls').classList.remove('hidden');
          document.getElementById('mood-book-revealed-info').classList.add('hidden');
        
          const backCard = document.getElementById('mood-book-back');
          if(currentMoodBook && !isLoading) {
              backCard.innerHTML = `<img src="${currentMoodBook.cover}" alt="${currentMoodBook.title}" class="w-full h-full object-cover rounded-lg">`;
          }

          setTimeout(() => moodBookSuggestion.scrollIntoView({ behavior: 'smooth' }), 100);
    }

    document.getElementById('reveal-mood-book-btn').addEventListener('click', () => {
        moodBookCard.classList.add('revealed');
        document.getElementById('mood-reveal-controls').classList.add('hidden');
        const info = document.getElementById('mood-book-revealed-info');
        info.classList.remove('hidden');
        document.getElementById('mood-book-title').textContent = currentMoodBook.title;
        document.getElementById('mood-book-author').textContent = `by ${currentMoodBook.author}`;
        const downloadLink = document.getElementById('mood-book-download');
        downloadLink.classList.remove('hidden');
        downloadLink.href = currentMoodBook.downloadLink;
    });

    document.getElementById('another-mood-book-btn').addEventListener('click', () => {
        if(currentSelectedMood) handleMoodSelection(currentSelectedMood);
        else {
              moodBookSuggestion.classList.add('hidden');
        }
    });

    // --- BLIND DATE ---
    const blindDateGrid = document.getElementById('blind-date-grid');
    const modal = document.getElementById('book-modal');
    const modalContent = document.getElementById('book-modal-content');
    
    function initBlindDate() {
        const shuffledBooks = [...books].sort(() => 0.5 - Math.random());
        const selectedBooks = shuffledBooks.slice(0, 12); // Show 12 random books

        blindDateGrid.innerHTML = '';
        selectedBooks.forEach(book => {
            const bookWrapper = document.createElement('div');
            bookWrapper.className = 'wrapped-book bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer flex flex-col justify-between text-center border-2 border-dashed border-gray-600';
            bookWrapper.innerHTML = `
                <div>
                    <div class="flex justify-center mb-4"><i data-lucide="gift" class="w-12 h-12 text-[#f7b267]"></i></div>
                    <p class="text-gray-300 italic">"${book.teaser}"</p>
                </div>
                <span class="mt-4 text-sm font-semibold text-[#f7b267]">Click to unwrap</span>
            `;
            bookWrapper.addEventListener('click', () => showBookModal(book));
            blindDateGrid.appendChild(bookWrapper);
        });
         lucide.createIcons();
    }
    
    function showBookModal(book) {
        modalContent.innerHTML = `
            <div class="flex flex-col md:flex-row gap-8">
                <img src="${book.cover}" alt="${book.title}" class="w-full md:w-1/3 h-auto object-cover rounded-lg shadow-lg">
                <div class="md:w-2/3">
                    <h2 class="text-4xl font-bold mb-2 text-white">${book.title}</h2>
                    <p class="text-xl text-gray-400 mb-4">by ${book.author}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        ${book.moods.map(mood => `<span class="bg-gray-700 text-gray-300 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full">${mood}</span>`).join('')}
                    </div>
                    <p class="text-lg leading-relaxed">${book.teaser}</p>
                    <a href="${book.downloadLink}" target="_blank" class="inline-block mt-6 bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-400 transition duration-300"><i data-lucide="download" class="inline mr-2"></i>Get Download Link</a>
                </div>
            </div>
             <button id="close-modal-btn-inner" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                 <i data-lucide="x" class="w-8 h-8"></i>
             </button>
        `;
        modal.classList.remove('hidden');
        setTimeout(() => modalContent.classList.remove('scale-95'), 10);
        lucide.createIcons();
        document.getElementById('close-modal-btn-inner').addEventListener('click', closeModal);
    }

    function closeModal() {
        modalContent.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
    });
    
    // Add event listener to the static close button in the HTML
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);


    // --- STORY CHAIN ---
    const storyDisplay = document.getElementById('story-display');
    const storyForm = document.getElementById('story-form');
    const storyInput = document.getElementById('story-input');
    const aiContinueBtn = document.getElementById('ai-continue-btn');

    function renderStory() {
        storyDisplay.innerHTML = '';
        storyChain.forEach(line => {
            const p = document.createElement('p');
            p.textContent = line;
            storyDisplay.appendChild(p);
        });
        storyDisplay.scrollTop = storyDisplay.scrollHeight;
    }

    storyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newLine = storyInput.value.trim();
        if (newLine) {
            storyChain.push(newLine);
            renderStory();
            storyInput.value = '';
            localStorage.setItem('storyChain', JSON.stringify(storyChain));
        }
    });

    aiContinueBtn.addEventListener('click', async () => {
        const button = aiContinueBtn;
        button.disabled = true;
        button.innerHTML = '<div class="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white mx-auto"></div>';

        const fullStory = storyChain.join('\n');
        const prompt = `This is a collaborative story. Continue it with a single, compelling sentence that fits the tone. Do not repeat the previous line. Story so far:\n\n---\n${fullStory}\n---\n\nNext line:`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };

        const nextLine = await callGeminiAPI(payload);

        if (nextLine) {
            storyChain.push(nextLine.trim().replace(/^"|"$/g, '')); // Also remove quotes if AI adds them
            renderStory();
            localStorage.setItem('storyChain', JSON.stringify(storyChain));
        } else {
            alert("The AI couldn't think of a line right now. Please check your API key or try again!");
        }
        
        button.disabled = false;
        button.innerHTML = '✨ AI Continue';
    });

    // --- INITIALIZATION ---
    function init() {
        initMoods();
        initBlindDate();
        renderStory();
        lucide.createIcons();
        setActiveSection('mood-discovery');
    }

    init();
});
