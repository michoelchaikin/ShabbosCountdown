<script lang="ts">
  import { onMount } from 'svelte';
  import { jDate, findLocation, Utils } from 'jcal-zmanim';

  let nextSedra = '';
  let candleLighting = '';
  let timeRemaining = '';

  function calculateTimeRemaining(targetDate: Date): string {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      // Check if it's past Friday sunset
      if (now.getDay() === 5 && now.getHours() >= 18) {
        return "It's Shabbos!";
      } else {
        // If it's past the target time but not Shabbos, recalculate for next week
        const nextWeekTarget = new Date(targetDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        return calculateTimeRemaining(nextWeekTarget);
      }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
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
    const [hours, minutes] = timeString.split(':');
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const formattedHours = (parseInt(hours) % 12 || 12).toString();
    candleLighting = `${formattedHours}:${minutes} ${ampm}`;

    // Set up the candle lighting date for the countdown
    const gregorianDate = nextFriday.getDate();
    const [hours, minutes] = candleLighting.split(':').map(Number);
    const candleLightingDate = new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), gregorianDate.getDate(), hours, minutes);

    // Set up countdown timer
    const updateCountdown = () => {
      timeRemaining = calculateTimeRemaining(candleLightingDate);
    };

    updateCountdown(); // Initial call
    const countdownInterval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(countdownInterval); // Clean up on component unmount
    };
  });
</script>

<h1>Shabbos Countdown</h1>
<p>Next Sedra: {nextSedra}</p>
<p>Candle Lighting in Melbourne: {candleLighting}</p>
<p>Time until Shabbos: {timeRemaining}</p>
