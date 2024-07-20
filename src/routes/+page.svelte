<script lang="ts">
  import { onMount } from 'svelte';
  import { jDate, findLocation, Utils } from 'jcal-zmanim';

  let jewishDate = '';
  let sunset = '';

  onMount(() => {
    const today = jDate.now();
    jewishDate = today.toString();

    const jerusalem = findLocation('Jerusalem');
    const { sunset: sunsetTime } = today.getSunriseSunset(jerusalem);
    sunset = Utils.getTimeString(sunsetTime);
  });
</script>

<h1>Shabbos Countdown</h1>
<p>Today's Hebrew Date: {jewishDate}</p>
<p>Sunset in Jerusalem: {sunset}</p>
