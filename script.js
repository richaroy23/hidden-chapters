document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    let books = []; // We use 'let' because we will fill this array later
    
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
    const moodToGenreMap = {
        "adventurous": ["adventure", "fantasy", "fiction"],
        "romantic": ["romance", "fiction"],
        "mysterious": ["mystery", "thriller", "fiction"],
        "suspenseful": ["thriller", "crime", "fiction"],
        "humorous": ["comedy", "fiction"],
        "hopeful": ["fiction", "self-help"],
        "heartbreaking": ["drama", "fiction"],
        "inspiring": ["biography", "self-help"],
        "thought-provoking": ["philosophy", "history"],
        "sci-fi": ["science fiction", "fiction"],
        "scary": ["horror", "thriller"],
        "dark romance": ["romance", "drama"],
        "sexy": ["romance"],
        "bl romance": ["romance"],
        "gl romance": ["romance"],
        "drama": ["drama"],
        "tragedy": ["drama"],
        "fantasy": ["fantasy"]
    };
    function generateCoverTheme(book) {
        const colors = {
            "fiction": ["#1f2937", "#f59e0b"],
            "romance": ["#7f1d1d", "#fda4af"],
            "fantasy": ["#0f172a", "#38bdf8"],
            "thriller": ["#000000", "#ef4444"],
            "history": ["#3f3f46", "#fbbf24"],
            "science": ["#064e3b", "#22c55e"],
            "sci-fi": ["#082f49", "#67e8f9"],
            "horror": ["#1c1917", "#f97316"],
            "drama": ["#172554", "#a5b4fc"],
            "default": ["#111827", "#f7b267"]
        };

        const genre = (book.genre || "default").toLowerCase();
        const [bg, accent] = colors[genre] || colors["default"];

        return { bg, accent };
    }

    function escapeHTML(value = '') {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getInitials(title = '') {
        const parts = title.trim().split(/\s+/).filter(Boolean);
        return parts.slice(0, 2).map(part => part[0].toUpperCase()).join('') || 'BK';
    }

    function generateCoverHTML(book) {
        const { bg, accent } = generateCoverTheme(book);
        const safeTitle = escapeHTML(book.title || 'Unknown Title');
        const safeAuthor = escapeHTML(book.author || 'Unknown Author');
        const safeGenre = escapeHTML(book.genre || 'Fiction');
        const initials = getInitials(book.title || 'Book');

        return `
            <div class="book-cover" style="--cover-bg:${bg}; --cover-accent:${accent};" aria-label="Cover for ${safeTitle}">
                <div class="book-cover__spine"></div>
                <div class="book-cover__grain"></div>
                <div class="book-cover__badge">${safeGenre}</div>
                <div class="book-cover__title">${safeTitle}</div>
                <div class="book-cover__author">by ${safeAuthor}</div>
                <div class="book-cover__monogram">${initials}</div>
            </div>
        `;
    }

    // Load story from localStorage or use default
    let storyChain = JSON.parse(localStorage.getItem('storyChain')) || [
        "The old lighthouse stood on the cliff's edge, its lamp dark for the first time in a century.",
        "A small, leather-bound book appeared on its doorstep with the morning fog, holding a single, cryptic sentence inside.",
        "'The sea remembers what the land forgets,' it read, in a script that seemed to shift before the reader's eyes."
    ];

    let currentMoodBook = null;
    let currentSelectedMood = '';


    // --- STORY CHAIN ---
    const storyDisplay = document.getElementById('story-display');
    const storyForm = document.getElementById('story-form');
    const storyInput = document.getElementById('story-input');
    const aiContinueBtn = document.getElementById('ai-continue-btn');

    function updateStoryDisplay() {
        storyDisplay.innerHTML = storyChain.map(line => `<p>${line}</p>`).join('');
        storyDisplay.scrollTop = storyDisplay.scrollHeight;
        localStorage.setItem('storyChain', JSON.stringify(storyChain));
    }

    storyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newLine = storyInput.value.trim();
        if (newLine) {
            storyChain.push(newLine);
            updateStoryDisplay();
            storyInput.value = '';
        }
    });

    aiContinueBtn.addEventListener('click', async () => {
        aiContinueBtn.disabled = true;
        aiContinueBtn.innerHTML = '<div class="w-5 h-5 border-2 border-dashed rounded-full animate-spin"></div>';

        try {
            const storyText = storyChain.join(' ');
            const response = await fetch(API + '/api/story/continue', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ story: storyText })
            });

            // ✅ Add AI-generated line to story chain
            const data = await response.json();
            if (data.line) {
                storyChain.push('🤖 ' + data.line.trim());
                updateStoryDisplay();
            }

        } catch (error) {
            console.error('Story continuation failed:', error);
        } finally {
            aiContinueBtn.disabled = false;
            aiContinueBtn.innerHTML = 'AI Continue ✨';
        }
    });


    // --- NAVIGATION ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    const setActiveSection = (sectionId) => {
        sections.forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        }); navLinks.forEach(link => { link.classList.toggle('active', link.dataset.section === sectionId); }); window.scrollTo(0,0); if (!mobileMenu.classList.contains('hidden')) { mobileMenu.classList.add('hidden'); }
        // Load bookshelf whenever the user navigates to it
        if (sectionId === 'bookshelf') { loadBookshelf(); }
    }; navLinks.forEach(link => { link.addEventListener('click', (e) => {
            e.preventDefault();
            // A small fix to make sure clicking the icon inside the link also works
            const sectionId = e.target.closest('.nav-link').dataset.section;
            setActiveSection(sectionId);
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
            moodCard.addEventListener('click', (e) => handleMoodSelection(mood.name.toLowerCase(), e.currentTarget));
        
        });
        lucide.createIcons();
    }

    function handleMoodSelection(mood, clickedCard) {

    const allMoodCards = document.querySelectorAll('.mood-card');
    allMoodCards.forEach(card => card.classList.remove('active'));

    if (clickedCard) {
        clickedCard.classList.add('active');
    }

    currentSelectedMood = mood;

    const selectedMood = mood.toLowerCase();

    const possibleBooks = books.filter(book => {
        const moodsArray = book.moods.toLowerCase().split(',');
        return moodsArray.includes(selectedMood);
    });

    if (possibleBooks.length > 0) {
        currentMoodBook = possibleBooks[Math.floor(Math.random() * possibleBooks.length)];
        displayMoodBookTeaser();
    } else {
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
                <div class="flex justify-center mb-4">
                    <i data-lucide="gift" class="w-16 h-16 text-[#f7b267]"></i>
                </div>
                <h4 class="text-xl font-semibold mb-2">
                    A ${currentMoodBook.genre} novel...
                </h4>
                <p class="text-gray-300 italic">
                    "${currentMoodBook.teaser}"
                </p>
            </div>
            <p class="text-sm text-gray-500">
                Click "Reveal Book" to unwrap your surprise!
            </p>
        `;
        lucide.createIcons();
    }

    document.getElementById('mood-reveal-controls').classList.remove('hidden');
    document.getElementById('mood-book-revealed-info').classList.add('hidden');

    const backCard = document.getElementById('mood-book-back');

    if (currentMoodBook && !isLoading) {
        backCard.innerHTML = `
            <div class="cover-card">
                ${generateCoverHTML(currentMoodBook)}
            </div>
        `;

        setTimeout(() => {
            moodBookSuggestion.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}


    document.getElementById('reveal-mood-book-btn').addEventListener('click', () => {
    moodBookCard.classList.add('revealed');
    document.getElementById('mood-reveal-controls').classList.add('hidden');
    
    const info = document.getElementById('mood-book-revealed-info');
    info.classList.remove('hidden');
    
    document.getElementById('mood-book-title').textContent = currentMoodBook.title;
    document.getElementById('mood-book-author').textContent = `by ${currentMoodBook.author}`;
    
    // Update the "Buy" link
    const buyLink = document.getElementById('mood-book-buy-link');
    buyLink.href = currentMoodBook.buyLink;
    
    
    const downloadLink = document.getElementById('mood-book-download-link');
    
    if (currentMoodBook.downloadLink) {
        downloadLink.href = currentMoodBook.downloadLink;
        downloadLink.classList.remove('hidden'); 
    } else {
        downloadLink.classList.add('hidden'); 
    }

    // Wire up Add to Library for mood reveal
    const moodLibBtn = document.getElementById('mood-add-to-library-btn');
    moodLibBtn.onclick = () => handleAddToLibrary(currentMoodBook);
    // Reset button state in case it was used before
    moodLibBtn.className = 'inline-block mt-4 ml-4 bg-purple-600 text-white font-bold py-3 px-6 rounded-full hover:bg-purple-500 transition duration-300';
    moodLibBtn.innerHTML = '<i data-lucide="library" class="inline mr-2"></i>Add to Library';
    moodLibBtn.disabled = false;

    lucide.createIcons(); // Refresh icons
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
    const surpriseMeBtn = document.getElementById('surprise-me-btn');

    const blindDateLoaderHTML = `
    <div class="col-span-full flex flex-col items-center justify-center p-8">
        <div class="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[#f7b267]"></div>
        <p class="mt-4 text-lg text-gray-400">Finding some mysterious dates...</p>
    </div>
`;

    function initBlindDate(genreFilter = 'all') {
    const grid = document.getElementById('blind-date-grid');

    grid.innerHTML = blindDateLoaderHTML;
        
    setTimeout(() => {
        // Filter books by genre if a filter is applied
        const filteredBooks = genreFilter === 'all' 
            ? [...books] 
            : books.filter(book => book.genre.toLowerCase() === genreFilter.toLowerCase());

        const shuffledBooks = [...filteredBooks].sort(() => 0.5 - Math.random()); // Show 12 random books
        const selectedBooks = shuffledBooks.slice(0, 12);

        grid.innerHTML = '';

        if (selectedBooks.length === 0) {
            grid.innerHTML = `<p class="col-span-full text-center text-gray-400">No books found for this genre. Try another!</p>`;
            return;
        }

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
            grid.appendChild(bookWrapper);
        });
        lucide.createIcons();
    }, 500);
}  
// ADD THE NEW FUNCTION HERE
function initGenreFilters() {
    const filterContainer = document.getElementById('genre-filter-container');
    if (!filterContainer) return;

    // Get unique genres from the books data
    const genres = ['all', ...new Set(books.map(book => book.genre.toLowerCase()))];

    filterContainer.innerHTML = ''; // Clear existing buttons
    genres.forEach(genre => {
        const button = document.createElement('button');
        button.className = 'genre-filter-btn bg-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm';
        button.textContent = genre.charAt(0).toUpperCase() + genre.slice(1); // Capitalize
        button.dataset.genre = genre;

        if (genre === 'all') {
            button.classList.add('active'); // Set 'All' as active by default
        }

        button.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.genre-filter-btn').forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked one
            button.classList.add('active');
            // Re-initialize the blind date grid with the selected genre
            initBlindDate(genre);
        });
        filterContainer.appendChild(button);
    });
}

    surpriseMeBtn.addEventListener('click', () => {
    if (books.length > 0) {
        const randomBook = books[Math.floor(Math.random() * books.length)];
        showBookModal(randomBook);
    }
});

async function showBookModal(book) {
    // 1. Conditionally create the download button
    const downloadButtonHTML = book.downloadLink
        ? `<a href="${book.downloadLink}" target="_blank" class="inline-block mt-6 ml-4 bg-gray-600 text-white font-bold py-3 px-6 rounded-full hover:bg-gray-500 transition duration-300"><i data-lucide="download" class="inline mr-2"></i>Download Book</a>`
        : '';

    // 2. Set the basic modal content
    modalContent.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8">
            <div class="cover-card w-full md:w-1/3">
                ${generateCoverHTML(book)}
            </div>
            <div class="md:w-2/3" id="modal-text-content">
                <h2 class="text-4xl font-bold mb-2 text-white">${book.title}</h2>
                <p class="text-xl text-gray-400 mb-4">by ${book.author}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${book.moods.split(',').map(mood => `
                        <span class="bg-gray-700 text-gray-300 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full">
                            ${mood}
                        </span>
                    `).join('')}
                </div>
                <p class="text-lg leading-relaxed">${book.teaser}</p>
                
                <a href="${book.buyLink}" target="_blank" class="inline-block mt-6 bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-400 transition duration-300"><i data-lucide="shopping-cart" class="inline mr-2"></i>Link to Buy</a>
                
                <button id="share-book-btn" class="inline-block mt-6 ml-4 bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-400 transition duration-300"><i data-lucide="share-2" class="inline mr-2"></i>Share Discovery</button>
                
                <button id="add-to-library-btn" data-book-id="${book.id}" class="inline-block mt-6 ml-4 bg-purple-600 text-white font-bold py-3 px-6 rounded-full hover:bg-purple-500 transition duration-300"><i data-lucide="library" class="inline mr-2"></i>Add to Library</button>
                
                ${downloadButtonHTML}

                <div id="ai-recommendations" class="mt-8 pt-6 border-t border-gray-700 hidden">
                    <h4 class="text-xl font-bold text-[#f7b267] mb-3 flex items-center">
                        <i data-lucide="sparkles" class="w-5 h-5 mr-2"></i> AI: More Like This
                    </h4>
                    <div id="rec-list" class="flex flex-wrap gap-2">
                        </div>
                </div>
            </div>
        </div>
        <button id="close-modal-btn-inner" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <i data-lucide="x" class="w-8 h-8"></i>
        </button>
    `;

    modal.classList.remove('hidden');
    setTimeout(() => modalContent.classList.remove('scale-95'), 10);
    lucide.createIcons();

    // 3. --- NEW: FETCH AI RECOMMENDATIONS ---
    try {
        const recResponse = await fetch(`${API}/api/recommend/${book.id}`,
            { credentials: 'include'  });
        if (recResponse.ok) {
            const recommendations = await recResponse.json();
            const recSection = document.getElementById('ai-recommendations');
            const recList = document.getElementById('rec-list');

            if (recommendations.length > 0) {
                recSection.classList.remove('hidden');
                recList.innerHTML = recommendations.map(r => `
                    <span class="bg-[#1f294a] border border-gray-600 text-gray-300 px-3 py-1 rounded-full text-sm">
                        ${r.title}
                    </span>
                `).join('');
            }
        }
    } catch (err) {
        console.error("AI recommendations failed to load:", err);
    }

    // 4. Set up event listeners
    document.getElementById('share-book-btn').addEventListener('click', () => {
        const shareText = `Check out this book I found on Hidden Chapters!\n\nTitle: ${book.title}\nTeaser: "${book.teaser}"`;
        navigator.clipboard.writeText(shareText).then(() => {
            const notification = document.getElementById('clipboard-notification');
            notification.textContent = 'Book details copied to clipboard!';
            notification.classList.add('show');
            setTimeout(() => notification.classList.remove('show'), 3000);
        });
    });

    document.getElementById('close-modal-btn-inner').addEventListener('click', closeModal);

    // Add to Library button
    document.getElementById('add-to-library-btn').addEventListener('click', () => {
        const bookId = parseInt(document.getElementById('add-to-library-btn').dataset.bookId);
        handleAddToLibrary(book);
    });
}

    function closeModal() {
        modalContent.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
    });
    
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);

    // --- BOOK OF THE DAY ---
    function displayBookOfTheDay() {
        const bookOfTheDayContainer = document.getElementById('book-of-the-day');
        if (!bookOfTheDayContainer) return;

        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const bookIndex = dayOfYear % books.length;
        const dailyBook = books[bookIndex];

        bookOfTheDayContainer.innerHTML = `
            <h3 class="text-3xl font-bold mb-2 text-[#f7b267]">
                Today's Hidden Gem
            </h3>
            <p class="text-lg text-gray-400 mb-6">
                A special recommendation, just for today.
            </p>
            <div class="flex flex-col md:flex-row 
                        items-center gap-8 max-w-4xl mx-auto">
                <div class="cover-card w-48 h-72 flex-shrink-0">
                    ${generateCoverHTML(dailyBook)}
                </div>
                <div class="text-center md:text-left">
                    <h4 class="text-3xl font-bold text-white">
                        ${dailyBook.title}
                    </h4>
                    <p class="text-xl text-gray-400 mb-4">
                        by ${dailyBook.author}
                    </p>
                    <p class="text-gray-300 italic mb-6">
                        "${dailyBook.teaser}"
                    </p>
                    <button id="reveal-daily-book-btn"
                        class="bg-green-500 text-white font-bold 
                            py-3 px-6 rounded-full 
                            hover:bg-green-400 transition duration-300">
                        Learn More
                    </button>
                </div>
            </div>
        `;

        document.getElementById('reveal-daily-book-btn').addEventListener('click', () => {
            showBookModal(dailyBook);
        });
    }

    // --- SMART MOOD DETECTION ---
    function initSmartMoodDetection() {
        const input = document.getElementById('smart-mood-input');
        const btn = document.getElementById('smart-mood-btn');
        const resultBox = document.getElementById('smart-mood-result');
        const loadingEl = document.getElementById('smart-mood-loading');
        const outputEl = document.getElementById('smart-mood-output');
        const errorEl = document.getElementById('smart-mood-error');
        const explanationEl = document.getElementById('smart-mood-explanation');
        const tagsEl = document.getElementById('smart-mood-tags');
        const useBtn = document.getElementById('smart-mood-use-btn');

        let detectedMoods = [];

        async function detect() {
            const text = input.value.trim();
            if (!text) return;

            // Reset & show loading
            resultBox.classList.remove('hidden');
            loadingEl.classList.remove('hidden');

            document.getElementById('smart-mood-loading').classList.remove('hidden');
            document.getElementById('smart-mood-error').classList.add('hidden');
            document.getElementById('smart-mood-output').classList.add('hidden');

            btn.disabled = true;
            btn.classList.add('opacity-60');

            try {
                const res = await fetch(API + '/api/mood/detect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                const data = await res.json();

                loadingEl.classList.add('hidden');

                if (!res.ok || data.error) {
                    errorEl.textContent = data.error || 'Something went wrong. Try again.';
                    errorEl.classList.remove('hidden');
                    return;
                }


                // ✅ DIRECT BOOK RECOMMENDATION
                if (data.books && data.books.length > 0) {
                    currentMoodBook = data.books[0];
                    displayMoodBookTeaser();

                    setTimeout(() => {
                        document.getElementById('reveal-mood-book-btn')?.click();
                    }, 400);
                }

                // OPTIONAL: show detected moods (UI)
                explanationEl.textContent = data.explanation;

                tagsEl.innerHTML = '';
                data.moods.forEach(mood => {
                    const tag = document.createElement('span');
                    tag.className = "bg-gray-600 text-white text-xs px-3 py-1 rounded-full";
                    tag.textContent = mood;
                    tagsEl.appendChild(tag);
                });

                outputEl.classList.remove('hidden');

            } catch (err) {
                loadingEl.classList.add('hidden');
                errorEl.textContent = 'Server error. Is Flask running?';
                errorEl.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.classList.remove('opacity-60');
            }
        }

        btn.addEventListener('click', detect);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') detect(); });

        }

    // --- BOOKSHELF ---
    async function loadBookshelf() {
        const container = document.getElementById('bookshelf-grid');
        if (!container) return;

        // Show loading state
        container.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center p-8">
                <div class="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-[#f7b267]"></div>
                <p class="mt-4 text-gray-400">Loading your library...</p>
            </div>`;

        try {
            const res = await fetch(`${API}/api/bookshelf`, { credentials: 'include' });

            if (res.status === 401) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <p class="text-gray-400 text-lg mb-4">Sign in to see your saved books.</p>
                        <button onclick="openAuthModal('login')"
                            class="bg-[#f7b267] text-gray-900 font-bold px-6 py-3 rounded-full hover:bg-[#f4a24f] transition">
                            Sign In
                        </button>
                    </div>`;
                return;
            }

            const savedBooks = await res.json();

            if (!savedBooks.length) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <p class="text-gray-400 text-lg">Your library is empty.</p>
                        <p class="text-gray-500 text-sm mt-2">Add books using the "Add to Library" button when browsing.</p>
                    </div>`;
                return;
            }

            container.innerHTML = '';
            savedBooks.forEach(book => {
                const card = document.createElement('div');
                card.className = 'bg-[#1f294a] rounded-xl p-5 shadow-lg flex flex-col gap-3';
                card.innerHTML = `
                    <div class="cover-card w-full" style="height:180px">
                        ${generateCoverHTML(book)}
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white leading-tight">${escapeHTML(book.title)}</h3>
                        <p class="text-sm text-gray-400 mb-2">by ${escapeHTML(book.author)}</p>
                        <div class="flex flex-wrap gap-1 mb-3">
                            ${(book.moods || '').split(',').filter(Boolean).map(m =>
                                `<span class="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">${escapeHTML(m.trim())}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="flex gap-2 mt-auto">
                        <button class="shelf-open-btn flex-1 bg-[#f7b267] text-gray-900 font-semibold py-2 rounded-lg text-sm hover:bg-[#f4a24f] transition">
                            View
                        </button>
                        <button class="shelf-remove-btn bg-gray-700 text-gray-300 font-semibold py-2 px-3 rounded-lg text-sm hover:bg-red-700 hover:text-white transition">
                            Remove
                        </button>
                    </div>`;

                card.querySelector('.shelf-open-btn').addEventListener('click', () => showBookModal(book));
                card.querySelector('.shelf-remove-btn').addEventListener('click', async () => {
                    try {
                        await fetch(`${API}/api/bookshelf/remove/${book.id}`, {
                            method: 'DELETE', credentials: 'include'
                        });
                        card.remove();
                        // If grid is now empty, show the empty message
                        if (!container.children.length) loadBookshelf();
                    } catch(e) { console.error('Remove failed:', e); }
                });

                container.appendChild(card);
            });

            lucide.createIcons();

        } catch(e) {
            container.innerHTML = `<p class="col-span-full text-red-400 text-center py-8">Failed to load library. Is Flask running?</p>`;
        }
    }

    // --- INITIALIZATION ---
    async function init() {
        try {
            const response = await fetch(API + '/api/books', { credentials: 'include' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Books data received from API:", data); // <-- DEBUGGING LINE
            books = data;

            if (books.length > 0) {
                initBlindDate();
                initGenreFilters();
                displayBookOfTheDay();
                initMoods();
                initSmartMoodDetection();
                updateStoryDisplay();
            } else {
                throw new Error("No books found in the database.");
            }
        } catch (error) {
            console.error("Frontend Error:", error);
            const moodSelector = document.getElementById('mood-selector');
            if (moodSelector) {
                moodSelector.innerHTML = `<p class="col-span-full text-red-400">Failed to load books. Is the Flask server running?</p>`;
            }
        }
    }
    init();
});
// ─────────────────────────────────────────────
// AUTH — Login / Register / Session
// ─────────────────────────────────────────────

const API = 'http://127.0.0.1:5000'; // Keep absolute for backwards compat
let pendingAction = null;

// Check session on every page load
async function checkSession() {
    try {
        const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
        const data = await res.json();
        if (data.user) setLoggedInUI(data.user);  // /api/auth/me returns {user: {id, username}}
    } catch(e) {}
}

function setLoggedInUI(user) {
    document.getElementById('auth-guest').classList.add('hidden');
    document.getElementById('auth-user').classList.remove('hidden');
    document.getElementById('nav-username').textContent = user.username;
    // Normalise: /api/auth/me returns {id, username}, login returns {user_id, username}
    window.currentUser = { id: user.id || user.user_id, username: user.username };
}

function setLoggedOutUI() {
    document.getElementById('auth-guest').classList.remove('hidden');
    document.getElementById('auth-user').classList.add('hidden');
    window.currentUser = null;
}

function openAuthModal(tab = 'login', action = null) {
    pendingAction = action;
    document.getElementById('auth-modal').classList.remove('hidden');
    switchTab(tab);
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
    ['login-email','login-password','reg-username','reg-email','reg-password'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['login-error','reg-error'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

function switchTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-register').classList.toggle('hidden', isLogin);
    document.getElementById('tab-login').className = `flex-1 py-2 rounded-lg text-sm font-semibold transition ${isLogin ? 'bg-[#f7b267] text-gray-900' : 'text-gray-400'}`;
    document.getElementById('tab-register').className = `flex-1 py-2 rounded-lg text-sm font-semibold transition ${!isLogin ? 'bg-[#f7b267] text-gray-900' : 'text-gray-400'}`;
}

async function submitLogin() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');
    errEl.classList.add('hidden');

    if (!email || !password) {
        errEl.textContent = 'Please fill in all fields.';
        errEl.classList.remove('hidden');
        return;
    }

    try {
        const res = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            errEl.textContent = data.error || 'Login failed.';
            errEl.classList.remove('hidden');
            return;
        }
        // Backend returns { message, username, user_id, is_new_user }
        setLoggedInUI({ username: data.username, user_id: data.user_id });
        closeAuthModal();

        // ✅ REDIRECT NEW USERS — preserve pendingAction so it survives the redirect
        if (data.is_new_user) {
            if (pendingAction) {
                // Can't pass a function across pages; re-trigger add-to-library after onboarding
                sessionStorage.setItem('pendingAddBookId', JSON.stringify(window._pendingBook || null));
            }
            window.location.href = "http://127.0.0.1:5000/onboarding.html";
            return;
        }
        if (pendingAction) { pendingAction(); pendingAction = null; }
    } catch(e) {
        errEl.textContent = 'Network error. Is Flask running?';
        errEl.classList.remove('hidden');
    }
}

async function submitRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const errEl    = document.getElementById('reg-error');
    errEl.classList.add('hidden');

    if (!username || !email || !password) {
        errEl.textContent = 'Please fill in all fields.';
        errEl.classList.remove('hidden');
        return;
    }

    try {
        const res = await fetch(`${API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            errEl.textContent = data.error || 'Registration failed.';
            errEl.classList.remove('hidden');
            return;
        }
        closeAuthModal();
        window.location.href = 'http://127.0.0.1:5000/onboarding.html';
    } catch(e) {
        errEl.textContent = 'Network error. Is Flask running?';
        errEl.classList.remove('hidden');
    }
}

async function logout() {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setLoggedOutUI();
}

// ─────────────────────────────────────────────
// ADD TO LIBRARY
// ─────────────────────────────────────────────
async function handleAddToLibrary(book) {
    // If currentUser isn't set yet, re-check session first (handles page-refresh edge case)
    if (!window.currentUser) {
        try {
            const res  = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
            const data = await res.json();
            if (data.user) setLoggedInUI(data.user);
        } catch(e) {}
    }

    // Still not logged in — open modal and retry after login
    if (!window.currentUser) {
        window._pendingBook = book;   // remember for cross-page recovery
        openAuthModal('login', () => handleAddToLibrary(book));
        return;
    }

    const btn = document.activeElement;
    try {
        const res = await fetch(`${API}/api/bookshelf/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ book_id: book.id })
        });
        const data = await res.json();

        if (res.status === 409) {
            // Already in library
            btn.textContent = '✓ Already in Library';
            btn.classList.replace('bg-purple-600', 'bg-gray-600');
            return;
        }
        if (!res.ok) throw new Error(data.error);

        // Success feedback
        btn.innerHTML = '<i data-lucide="check" class="inline mr-2"></i>Added!';
        btn.classList.replace('bg-purple-600', 'bg-green-600');
        btn.disabled = true;
        lucide.createIcons();

        const notification = document.getElementById('clipboard-notification');
        notification.textContent = `"${book.title}" added to your library!`;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);

    } catch(e) {
        console.error('Add to library failed:', e);
    }
}

// Close auth modal on backdrop click
document.getElementById('auth-modal')?.addEventListener('click', function(e) {
    if (e.target === this) closeAuthModal();
});

// Enter key on login password
document.getElementById('login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitLogin();
});

// Check session on load
checkSession();