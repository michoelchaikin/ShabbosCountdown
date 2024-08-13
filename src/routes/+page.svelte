<script lang="ts">
  import { onMount } from 'svelte';
  import { jDate, findLocation, Utils } from 'jcal-zmanim';

  let nextSedra = '';
  let candleLighting = '';
  let timeRemaining = '';
  let days = 0, hours = 0, minutes = 0, seconds = 0;

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

  onMount(() => {
    const today = jDate.now();
    const melbourne = findLocation('Melbourne');
    
    // Find the next Friday
    let nextFriday = today;
    while (nextFriday.DayOfWeek !== 6) {
      nextFriday = nextFriday.addDays(1);
    }

    // Get the day before (Thursday) for candle lighting
    const thursdayBeforeShabbos = nextFriday.addDays(-1);

    nextSedra = nextFriday.getSedra(true).toString();
    const candleLightingTime = thursdayBeforeShabbos.getCandleLighting(melbourne);
    const timeString = Utils.getTimeString(candleLightingTime);
    let [hours, minutes] = timeString.split(':').map(Number);
    const formattedHours = (hours % 12 || 12).toString();
    candleLighting = `${formattedHours}:${minutes.toString().padStart(2, '0')} PM`;

    // Set up the candle lighting date for the countdown
    const gregorianDate = nextFriday.getDate();
    const [time, period] = candleLighting.split(' ');
    let [candleHours, candleMinutes] = time.split(':').map(Number);
    if (period === 'PM' && candleHours !== 12) candleHours += 12;
    if (period === 'AM' && candleHours === 12) candleHours = 0;
    const candleLightingDate = new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), gregorianDate.getDate(), candleHours, candleMinutes);

    // Set up countdown timer
    const updateCountdown = () => {
      calculateTimeRemaining(candleLightingDate);
    };

    updateCountdown(); // Initial call
    const countdownInterval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(countdownInterval); // Clean up on component unmount
    };
  });
</script>

<main>
  <h1>Shabbos Countdown</h1>
  <div class="info">
    <p>📖 <span>{nextSedra}</span></p>
    <p>🕯️ <span>{candleLighting}</span></p>
    <p>📍 Melbourne</p>
  </div>
  <div class="countdown">
    <div class="time-unit">
      <span class="number">{days}</span>
      <span class="label">Days</span>
    </div>
    <div class="time-unit">
      <span class="number">{hours}</span>
      <span class="label">Hours</span>
    </div>
    <div class="time-unit">
      <span class="number">{minutes}</span>
      <span class="label">Minutes</span>
    </div>
    <div class="time-unit">
      <span class="number">{seconds}</span>
      <span class="label">Seconds</span>
    </div>
  </div>
</main>

<style>
  main {
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
    color: #333;
  }

  h1 {
    font-size: 2.5em;
    margin-bottom: 20px;
    color: #1a237e;
  }

  .info {
    margin-bottom: 30px;
  }

  .info p {
    margin: 10px 0;
  }

  .info span {
    font-weight: bold;
    color: #1a237e;
  }

  .countdown {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
  }

  .time-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .number {
    font-size: 3em;
    font-weight: bold;
    color: #1a237e;
  }

  .label {
    font-size: 0.9em;
    text-transform: uppercase;
    margin-top: 5px;
  }
</style>
