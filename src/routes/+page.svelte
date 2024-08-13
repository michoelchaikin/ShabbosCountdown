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
  let timeRemaining = '';
  let days = 0, hours = 0, minutes = 0, seconds = 0;
  let location = '';
  let isLoading = true;

  function calculateTimeRemaining(targetDate: Date): void {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      // Check if it's past Friday sunset
      if (now.getDay() === 5 && now.getHours() >= 18) {
        timeRemaining = "It's Shabbos!";
        return;
      } else {
        // If it's past the target time but not Shabbos, recalculate for next week
        const nextWeekTarget = new Date(targetDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        calculateTimeRemaining(nextWeekTarget);
        return;
      }
    }

    days = Math.floor(difference / (1000 * 60 * 60 * 24));
    hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((difference % (1000 * 60)) / 1000);
  }

  onMount(async () => {
    console.log('onMount started');
    location = $page.url.searchParams.get('location') || 'Melbourne';
    console.log('Location:', location);
    const today = jDate.now();
    console.log('Today:', today.toString());
    const locationObj = findLocation(location);
    
    if (!locationObj) {
      console.error('Invalid location');
      isLoading = false;
      return;
    }
    console.log('Location object:', locationObj);

    // Find the next Friday
    let nextFriday = today;
    while (nextFriday.DayOfWeek !== 6) {
      nextFriday = nextFriday.addDays(1);
    }
    console.log('Next Friday:', nextFriday.toString());

    // Get the day before (Thursday) for candle lighting
    const thursdayBeforeShabbos = nextFriday.addDays(-1);
    console.log('Thursday before Shabbos:', thursdayBeforeShabbos.toString());

    nextSedra = nextFriday.getSedra(true).toString();
    console.log('Next Sedra:', nextSedra);
    const candleLightingTime = thursdayBeforeShabbos.getCandleLighting(locationObj);
    console.log('Candle lighting time:', candleLightingTime);
    const timeString = Utils.getTimeString(candleLightingTime);
    console.log('Time string:', timeString);
    let [hours, minutes] = timeString.split(':').map(Number);
    const formattedHours = (hours % 12 || 12).toString();
    candleLighting = `${formattedHours}:${minutes.toString().padStart(2, '0')} PM`;
    console.log('Formatted candle lighting time:', candleLighting);

    // Set up the candle lighting date for the countdown
    const gregorianDate = nextFriday.getDate();
    console.log('Gregorian date:', gregorianDate);
    const [time, period] = candleLighting.split(' ');
    let [candleHours, candleMinutes] = time.split(':').map(Number);
    if (period === 'PM' && candleHours !== 12) candleHours += 12;
    if (period === 'AM' && candleHours === 12) candleHours = 0;
    const candleLightingDate = new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), gregorianDate.getDate(), candleHours, candleMinutes);
    console.log('Candle lighting date:', candleLightingDate);

    // Set up countdown timer
    const updateCountdown = () => {
      calculateTimeRemaining(candleLightingDate);
      console.log('Countdown updated:', { days, hours, minutes, seconds });
    };

    updateCountdown(); // Initial call
    const countdownInterval = setInterval(updateCountdown, 1000);

    // Simulate a short delay to show the loading animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    isLoading = false;
    console.log('Loading finished');

    return () => {
      clearInterval(countdownInterval); // Clean up on component unmount
      console.log('Component unmounted, interval cleared');
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

  main {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Lato', sans-serif;
    color: #1a237e;
  }

  .loading p {
    font-family: 'Lato', sans-serif;
  }

  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #1a237e;
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
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    padding: 40px;
    max-width: 600px;
    width: 90%;
  }

  .info {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    transition: transform 0.3s ease;
  }

  .info-item:hover {
    transform: translateY(-5px);
  }

  .info-text {
    font-weight: 500;
    color: #1a237e;
    text-align: center;
    margin-top: 10px;
  }

  .countdown {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 10px;
  }

  .time-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    background-color: #f0f4f8;
    border-radius: 15px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    flex: 1;
    min-width: 70px;
    margin: 0 5px;
  }

  .time-unit:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .number {
    font-family: 'Lato', sans-serif;
    font-size: 2em;
    font-weight: bold;
    color: #1a237e;
  }

  .label {
    font-family: 'Lato', sans-serif;
    font-size: 0.8em;
    text-transform: uppercase;
    margin-top: 5px;
    color: #5c6bc0;
  }

  .info-text {
    font-family: 'Lato', sans-serif;
  }

  @media (max-width: 480px) {
    .container {
      padding: 20px;
    }

    .info-item {
      padding: 10px;
    }

    .time-unit {
      padding: 10px;
      min-width: 60px;
    }

    .number {
      font-size: 1.6em;
    }

    .label {
      font-size: 0.7em;
    }
  }
</style>
