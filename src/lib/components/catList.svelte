<script context="module">
	import { writable } from 'svelte/store';

    export let catList = writable([
		{
			value: 'random',
			label: 'Random',
			checked: true,
			tooltip: 'Random prompts, could be anything!',
		},
		{
			value: 'closeFriends',
			label: 'Close Friends',
			checked: false,
			tooltip: 'Geared towards people who are willing to be vulnerable...',
		},
		{
			value: 'newFriends',
			label: 'New Friends',
			checked: false,
			tooltip: 'Get to know someone a bit better!',
		},
		{
			value: 'dateNight',
			label: 'Date Night',
			checked: false,
			tooltip: 'Prompts for getting to know a partner.',
		},
		{
			value: 'happy',
			label: 'Happy',
			checked: false,
			tooltip: 'Think happy thoughts!',
		},
		{
			value: 'heavy',
			label: 'Heavy',
			checked: false,
			tooltip: 'These prompts could touch on heavy or sensitive topics.',
		},
		{
			value: 'kids',
			label: 'Kids',
			checked: false,
			tooltip: 'Prompts appropriate for all ages!',
		},
		{
			value: 'music',
			label: 'Music',
			checked: false,
			tooltip: 'Help inspire a playlist!',
		},
		{
			value: 'movies',
			label: 'Movies',
			checked: false,
			tooltip: 'If you want a "reel" talk!',
		},
		{
			value: 'journal',
			label: 'Journal',
			checked: false,
			tooltip: 'Prompts that help you reflect.',
		},
		{
			value: 'politics',
			label: 'Politics',
			checked: false,
			tooltip: 'In case anyone wants more politics in their life.',
		},
		{
			value: 'silly',
			label: 'Silly',
			checked: false,
			tooltip: 'For some bizarre or amusing prompts...',
		},
		{
			value: 'philosophy',
			label: 'Philosophy',
			checked: false,
			tooltip: 'For spiritual or philisophical considerations.',
		},
		{
			value: 'mature',
			label: 'Mature',
			checked: false,
			tooltip: "Prompts that might deserve an age restriction.",
		},
		{
			value: 'fortune',
			label: 'Fortune Teller',
			checked: false,
			tooltip: 'Try to guess which friend a fortune is talking about!',
		},
		{
			value: 'activities',
			label: 'Activities',
			checked: false,
			tooltip: "For anything other than conversation prompts.",
		},
		{
			value: 'wyr',
			label: 'Would You Rather',
			checked: false,
			tooltip: 'This, or that?',
		},
		{
			value: 'quotes',
			label: 'Quotes',
			checked: false,
			tooltip: 'Ponder and discuss some famous quotes.',
		},
	]);

	

</script>