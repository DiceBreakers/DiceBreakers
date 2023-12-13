<script context="module">
	import { writable } from 'svelte/store';

    export let catList = writable([
		{
			value: 'happy',
			label: 'Happy',
			checked: true,
			filter: true,
			tooltip: 'Think happy thoughts!',
		},
		{
			value: 'newFriends',
			label: 'New Friends',
			checked: true,
			filter: true,
			tooltip: 'Get to know someone a bit better!',
		},
		{
			value: 'philosophy',
			label: 'Philosophy',
			checked: true,
			filter: true,
			tooltip: 'For philisophical or ethical conversations.',
		},
		{
			value: 'closeFriends',
			label: 'Close Friends',
			checked: true,
			filter: true,
			tooltip: 'Geared towards people who are willing to be vulnerable...',
		},
		{
			value: 'wyr',
			label: 'Would You Rather',
			checked: true,
			filter: true,
			tooltip: 'This, or that?',
		},
		{
			value: 'silly',
			label: 'Silly',
			checked: false,
			filter: true,
			tooltip: 'For some bizarre or amusing conversations...',
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
			value: 'heavy',
			label: 'Heavy',
			checked: false,
			filter: true,
			tooltip: 'These could touch on heavy or sensitive topics.',
		},
		{
			value: 'dateNight',
			label: 'Date Night',
			checked: false,
			filter: true,
			tooltip: 'Conversations for getting to know a partner.',
		},
		{
			value: 'journal',
			label: 'Journal',
			checked: false,
			filter: true,
			tooltip: 'If you want to reflect.',
		},
		{
			value: 'politics',
			label: 'Politics',
			checked: false,
			filter: true,
			tooltip: 'In case anyone wants more politics in their life.',
		},
		{
			value: 'kids',
			label: 'Kids',
			checked: false,
			filter: true,
			tooltip: 'Conversations appropriate for all ages!',
		},
		{
			value: 'mature',
			label: 'Mature',
			checked: false,
			filter: true,
			tooltip: "Conversations for an older crowd.",
		},
		{
			value: 'fortune',
			label: 'Fortune Teller',
			checked: false,
			filter: true,
			tooltip: 'Try to guess which friend a fortune is talking about!',
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