<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { jDate, findLocation, Utils } from 'jcal-zmanim';
  import Icon from '@iconify/svelte';
  import bookOpenPageVariant from '@iconify-icons/mdi/book-open-page-variant';
  import candle from '@iconify-icons/mdi/candle';
  import mapMarker from '@iconify-icons/mdi/map-marker';
  import { page } from '$app/stores';

  let nextSedra = '';
  let candleLighting = '';
  let days = 0, hours = 0, minutes = 0, seconds = 0;
  let location = '';
  let isLoading = true;
  let isDarkMode = false;

  function toggleDarkMode(darkMode: boolean) {
    isDarkMode = darkMode;
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  function calculateTimeRemaining(targetDate: Date): void {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    days = Math.floor(difference / (1000 * 60 * 60 * 24));
    hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((difference % (1000 * 60)) / 1000);
  }

  onMount(async () => {
    // Check system preference for dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    toggleDarkMode(prefersDarkMode);

    // Listen for changes in system preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      toggleDarkMode(e.matches);
    });

    location = $page.url.searchParams.get('location') || 'Melbourne';

    const locationObj = findLocation(location);
    
    if (!locationObj) {
      isLoading = false;
      return;
    }

    const today = jDate.now();
    let friday = today.addDays(today.DayOfWeek - 5);
    nextSedra = friday.getSedra(true).toString();
    const candleLightingTime = friday.getCandleLighting(locationObj);

    candleLighting = `${candleLightingTime.hour - 12}:${candleLightingTime.minute} PM`;

    const candleLightingAsDate : Date = friday.getDate();
    candleLightingAsDate.setHours(candleLightingTime.hour);
    candleLightingAsDate.setMinutes(candleLightingTime.minute);

    const updateCountdown = () => {
      calculateTimeRemaining(candleLightingAsDate);
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    isLoading = false;

    return () => {
      clearInterval(countdownInterval);
    };
  });
</script>

<main>
  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  {:else}
    <div class="container" transition:fade={{ duration: 300 }}>
    <div class="info">
      <div class="info-item">
        <Icon icon={bookOpenPageVariant} color="#1a237e" width="48" height="48" />
        <span class="info-text">{nextSedra}</span>
      </div>
      <div class="info-item">
        <Icon icon={candle} color="#1a237e" width="48" height="48" />
        <span class="info-text">{candleLighting}</span>
      </div>
      <div class="info-item">
        <Icon icon={mapMarker} color="#1a237e" width="48" height="48" />
        <span class="info-text">{location}</span>
      </div>
    </div>
    <div class="countdown">
      {#each [{value: days, label: 'Days'}, {value: hours, label: 'Hours'}, {value: minutes, label: 'Minutes'}, {value: seconds, label: 'Seconds'}] as unit}
        <div class="time-unit">
          <span class="number">{unit.value}</span>
          <span class="label">{unit.label}</span>
        </div>
      {/each}
    </div>
    </div>
  {/if}
</main>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');

  :global(body) {
    margin: 0;
    padding: 0;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  :global(body.dark-mode) {
    background-color: #121212;
    color: #ffffff;
  }

  main {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--background-color, white);
    color: var(--text-color, #333);
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Lato', sans-serif;
    color: var(--primary-color, #1a237e);
  }

  .loading p {
    font-family: 'Lato', sans-serif;
  }

  .spinner {
    border: 4px solid var(--spinner-color, #f3f3f3);
    border-top: 4px solid var(--primary-color, #1a237e);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .container {
    padding: 40px;
    max-width: 600px;
    width: 90%;
  }

  .info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    width: 100%;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    transition: transform 0.3s ease;
    flex: 1;
  }

  .info-item:hover {
    transform: translateY(-5px);
  }

  .info-text {
    font-weight: 500;
    color: var(--primary-color, #1a237e);
    text-align: center;
    margin-top: 10px;
    font-family: 'Lato', sans-serif;
    font-size: 0.9em;
    word-break: break-word;
  }

  .countdown {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    width: 100%;
  }

  .time-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px 5px;
    background-color: var(--time-unit-bg, #f0f4f8);
    border-radius: 15px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    min-height: 80px;
    flex: 1;
    min-width: 0;
    margin: 0 2px;
  }

  .time-unit:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .number {
    font-family: 'Lato', sans-serif;
    font-size: 1.5em;
    font-weight: bold;
    color: var(--primary-color, #1a237e);
    min-width: 1.5em;
    text-align: center;
  }

  .label {
    font-family: 'Lato', sans-serif;
    font-size: 0.7em;
    text-transform: uppercase;
    margin-top: 5px;
    color: var(--secondary-color, #5c6bc0);
    text-align: center;
  }

  @media (max-width: 600px) {
    .info-text {
      font-size: 0.8em;
    }

    .number {
      font-size: 1.2em;
    }

    .label {
      font-size: 0.6em;
    }
  }

  @media (max-width: 400px) {
    .time-unit {
      padding: 5px 2px;
    }

    .number {
      font-size: 1em;
    }

    .label {
      font-size: 0.5em;
    }
  }

  :global(.dark-mode) {
    --background-color: #121212;
    --text-color: #ffffff;
    --primary-color: #d6b5ff;
    --secondary-color: #64ffda;
    --time-unit-bg: #1f1f1f;
    --spinner-color: #4d4d4d;
  }
</style>
