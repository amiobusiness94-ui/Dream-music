import { BlogPost } from '../types';

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Maximizing Your Music Streaming Royalties: An Independent Artist\'s Guide',
    slug: 'maximizing-streaming-royalties',
    summary: 'Streaming algorithms can feel like a black box. Discover actionable tactics to boost your streaming numbers, clear payouts, and audit your digital assets correctly.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category: 'Guides',
    date: 'July 5, 2026',
    tags: ['Royalties', 'Streaming', 'Marketing'],
    content: `
Streaming services like Spotify, Apple Music, and JioSaavn pay out billions of dollars in royalties annually, yet many independent artists struggle to earn more than pocket change. The key isn't just about getting on play-lists—it's about building a robust metadata ecosystem and optimizing your distribution pathways.

### 1. The Anatomy of Streaming Royalties
To maximize your revenue, you must understand what you are getting paid for. When your song is streamed, two distinct copyrights generate royalties:
*   **Recording Rights (Master Royalties):** Paid to the owner of the audio recording (the artist or label). This is what platforms like Dream Records collect and pass 100% back to you.
*   **Publishing Rights (Composition Royalties):** Paid to the songwriters and composers for the underlying melody and lyrics. This includes mechanical royalties and public performance royalties.

### 2. Guard Your Metadata Fiercely
Algorithmic recommendation engines rely entirely on accurate metadata. If your credits are incomplete, your tracks won't be pushed to listeners of similar music. 
*   Always include ISRC (International Standard Recording Code) and UPC (Universal Product Code) numbers.
*   Clearly state contributing songwriters, lyricists, and producers.
*   Use standard, clear spelling for artist names to prevent split profiles on Spotify or Apple Music.

### 3. Pre-Save Campaigns Are Non-Negotiable
Spotify's algorithm rewards immediate engagement. When a track gets a burst of streams on its release day, it triggers placement on editorial lists like *Release Radar* and *Discover Weekly*. Setting up a pre-save campaign weeks in advance ensures your fans are locked in and ready to stream the moment your track goes live.
    `,
    comments: [
      { author: 'Amit Sharma', text: 'This cleared up so much confusion about publishing royalties versus master royalties! Thank you!', date: 'July 6, 2026' },
      { author: 'Neha Sen', text: 'Pre-saves have completely changed my release day numbers. Definitely recommend setting it up 3 weeks ahead.', date: 'July 7, 2026' }
    ]
  },
  {
    id: '2',
    title: 'Why Proper Song Metadata Matters for Digital Music Distribution',
    slug: 'metadata-importance-music-distribution',
    summary: 'A minor typo in your composer credit can hold back your song from hit playlists or delay your payouts. Learn the standard metadata guidelines required by global stores.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category: 'Distribution',
    date: 'June 28, 2026',
    tags: ['Metadata', 'Copyright', 'Industry Secrets'],
    content: `
When you distribute music to global stores like Apple Music, Spotify, Amazon Music, and Gaana, you aren’t just sending an audio file and a cover art—you are sending a massive package of data. This data, known as **metadata**, is what allows stores to categorize, display, credit, and pay you for your music correctly.

### The Consequences of Bad Metadata
If your metadata has errors, one of three things will happen:
1.  **Rejection:** The stores' strict quality control systems will reject your release entirely.
2.  **Split Profiles:** Your song will end up on another artist's page with the same name, or a duplicate empty profile will be created.
3.  **Unclaimed Royalties:** If PROs (Performing Rights Organizations) cannot match your song metadata to their databases, your performance royalties will sit in a "black box" and eventually dissolve.

### Dream Records\' AI-Powered Compliance
Here at Dream Records, we built an **AI Metadata Checker** directly into our release portal. It cross-checks spelling, capitalization, genre consistency, cover art resolution, and lyric guidelines automatically before your release is pushed to reviewers. This reduces rejection rates to less than 0.5%, getting your music online faster than ever.
    `,
    comments: [
      { author: 'Rahul Roy', text: 'I had a split profile issue last year and it took months to resolve. Accurate metadata is indeed crucial!', date: 'June 29, 2026' }
    ]
  },
  {
    id: '3',
    title: 'The Ultimate Guide to YouTube Content ID & Official Artist Channels',
    slug: 'youtube-content-id-oac-guide',
    summary: 'Claim your official music presence on YouTube. Learn how Content ID scans and monetizes videos using your music, and how to acquire your music note badge.',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    category: 'Publishing',
    date: 'May 15, 2026',
    tags: ['YouTube', 'Content ID', 'Monetization'],
    content: `
YouTube is the largest music search engine on the planet. For independent creators, it offers two extremely powerful features that can significantly scale your revenue and professional brand: **YouTube Content ID** and the **Official Artist Channel (OAC)**.

### What is YouTube Content ID?
Content ID is YouTube's automated fingerprinting system. When you distribute your music through Dream Records and opt-in to YouTube Monetization, we submit your audio to the Content ID database. 
YouTube then continuously scans every video uploaded to the platform. If someone uses your song in their travel vlog, gaming clip, or reaction video, a claim is automatically placed. You can then choose to monetize that video, redirecting ad revenue directly into your Dream Records wallet.

### How to Get Your Official Artist Channel (OAC) Badge
You've likely seen the musical note icon next to your favorite artists' channel names. This is the Official Artist Channel badge. It merges your personal channel, topic channel, and Vevo channel into a single cohesive hub.
*   **Step 1:** Distribute at least 1-3 official releases through an approved distributor like Dream Records.
*   **Step 2:** Ensure your personal YouTube channel has the same name as your artist release profiles.
*   **Step 3:** Request an OAC upgrade directly via the Dream Records support portal.
    `,
    comments: [
      { author: 'Vikram Das', text: 'Just requested my OAC through Dream Records. The process was super simple!', date: 'May 20, 2026' }
    ]
  }
];
