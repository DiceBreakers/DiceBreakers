<script context="module">
	import { writable } from 'svelte/store';

    export let catList = writable([
		{
			value: 'closeFriends',
			label: 'Close Friends',
			checked: true,
			filter: true,
			tooltip: 'Geared towards people who are willing to be vulnerable...',
		},
		{
			value: 'newFriends',
			label: 'New Friends',
			checked: true,
			filter: true,
			tooltip: 'Get to know someone a bit better!',
		},
		{
			value: 'dateNight',
			label: 'Date Night',
			checked: true,
			filter: true,
			tooltip: 'Prompts for getting to know a partner.',
		},
		{
			value: 'happy',
			label: 'Happy',
			checked: true,
			filter: true,
			tooltip: 'Think happy thoughts!',
		},
		{
			value: 'heavy',
			label: 'Heavy',
			checked: true,
			filter: true,
			tooltip: 'These prompts could touch on heavy or sensitive topics.',
		},
		{
			value: 'kids',
			label: 'Kids',
			checked: false,
			filter: true,
			tooltip: 'Prompts appropriate for all ages!',
		},
		{
			value: 'music',
			label: 'Music',
			checked: false,
			filter: true,
			tooltip: 'Help inspire a playlist!',
		},
		{
			value: 'movies',
			label: 'Movies',
			checked: false,
			filter: true,
			tooltip: 'If you want a "reel" talk!',
		},
		{
			value: 'journal',
			label: 'Journal',
			checked: false,
			filter: true,
			tooltip: 'Prompts that help you reflect.',
		},
		{
			value: 'politics',
			label: 'Politics',
			checked: false,
			filter: true,
			tooltip: 'In case anyone wants more politics in their life.',
		},
		{
			value: 'silly',
			label: 'Silly',
			checked: false,
			filter: true,
			tooltip: 'For some bizarre or amusing prompts...',
		},
		{
			value: 'philosophy',
			label: 'Philosophy',
			checked: false,
			filter: true,
			tooltip: 'For philisophical or spiritual considerations.',
		},
		{
			value: 'mature',
			label: 'Mature',
			checked: false,
			filter: true,
			tooltip: "Prompts for an older crowd.",
		},
		{
			value: 'fortune',
			label: 'Fortune Teller',
			checked: false,
			filter: true,
			tooltip: 'Try to guess which friend a fortune is talking about!',
		},
		{
			value: 'wyr',
			label: 'Would You Rather',
			checked: false,
			filter: true,
			tooltip: 'This, or that?',
		},
		{
			value: 'quotes',
			label: 'Quotes',
			checked: false,
			filter: true,
			tooltip: 'Ponder and discuss some famous quotes.',
		},
	]);

	

</script>