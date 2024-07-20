<script lang="ts">
  import { onMount } from 'svelte';
  import { jDate, findLocation, Utils } from 'jcal-zmanim';

  let jewishDate = '';
  let nextParsha = '';
  let candleLighting = '';

  onMount(() => {
    const today = jDate.now();
    jewishDate = today.toString();

    const jerusalem = findLocation('Jerusalem');
    
    // Find the next Friday
    let nextFriday = today;
    while (nextFriday.getDayOfWeek() !== 6) {
      nextFriday = nextFriday.addDays(1);
    }

    nextParsha = Utils.getParsha(nextFriday);
    const candleLightingTime = Utils.getCandleLighting(nextFriday, jerusalem);
    candleLighting = Utils.getTimeString(candleLightingTime);
  });
</script>

<h1>Shabbos Countdown</h1>
<p>Today's Hebrew Date: {jewishDate}</p>
<p>Next Parsha: {nextParsha}</p>
<p>Candle Lighting in Jerusalem: {candleLighting}</p>
