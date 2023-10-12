<script context="module">
	import { writable } from 'svelte/store';

    export let catList = writable([
		{
			value: 'random',
			label: 'Random',
			checked: true,
		},
		{
			value: 'closeFriends',
			label: 'Close Friends',
			checked: false,
		},
		{
			value: 'newFriends',
			label: 'New Friends',
			checked: false,
		},
		{
			value: 'dateNight',
			label: 'Date Night',
			checked: false,
		},
		{
			value: 'happy',
			label: 'Happy',
			checked: false,
		},
		{
			value: 'heavy',
			label: 'Heavy',
			checked: false,
		},
		{
			value: 'kids',
			label: 'Kids',
			checked: false,
		},
		{
			value: 'music',
			label: 'Music',
			checked: false,
		},
		{
			value: 'movies',
			label: 'Movies',
			checked: false,
		},
		{
			value: 'journal',
			label: 'Journal',
			checked: false,
		},
		{
			value: 'politics',
			label: 'Politics',
			checked: false,
		},
		{
			value: 'silly',
			label: 'Silly',
			checked: false,
		},
		{
			value: 'philosophy',
			label: 'Philosophy',
			checked: false,
		},
		{
			value: 'mature',
			label: 'Mature',
			checked: false,
		},
		{
			value: 'fortune',
			label: 'Fortune Teller',
			checked: false,
		},
		{
			value: 'activities',
			label: 'Activities',
			checked: false,
		},
		{
			value: 'wyr',
			label: 'Would You Rather',
			checked: false,
		},
	]);

</script>