<script lang="ts">
  import { onMount } from 'svelte';
  import { jDate, findLocation, Utils } from 'jcal-zmanim';

  let jewishDate = '';
  let nextSedra = '';
  let candleLighting = '';

  onMount(() => {
    const today = jDate.now();
    jewishDate = today.toString();

    const jerusalem = findLocation('Jerusalem');
    
    // Find the next Friday
    let nextFriday = today;
    while (nextFriday.DayOfWeek !== 6) {
      nextFriday = nextFriday.addDays(1);
    }

    nextSedra = nextFriday.getSedra(true).toString();
    const candleLightingTime = nextFriday.getCandleLighting(jerusalem);
    candleLighting = Utils.getTimeString(candleLightingTime);
  });
</script>

<h1>Shabbos Countdown</h1>
<p>Today's Hebrew Date: {jewishDate}</p>
<p>Next Sedra: {nextSedra}</p>
<p>Candle Lighting in Jerusalem: {candleLighting}</p>
