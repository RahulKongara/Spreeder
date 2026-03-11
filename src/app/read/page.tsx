"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

function getOrpIndex(word: string): number {
	const len = word.length;
	if (len <= 1) return 0;
	if (len <= 5) return 1;
	if (len <= 9) return 2;
	if (len <= 13) return 3;
	return 4;
}

export default function ReadPage() {
	const router = useRouter();
	const [words, setWords] = useState<string[]>([]);
	const [index, setIndex] = useState(0);
	const [running, setRunning] = useState(false);
	const [wpm, setWpm] = useState(300);
	const [done, setDone] = useState(false);
	const [showControls, setShowControls] = useState(true);
	const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => {
		const text = sessionStorage.getItem("spreed-text") || "";
		const savedWpm = Number(sessionStorage.getItem("spreed-wpm")) || 300;
		if (!text.trim()) { router.push("/"); return; }
		setWords(text.trim().split(/\s+/));
		setWpm(savedWpm);
	}, [router]);

	useEffect(() => {
		if (!running || done || words.length === 0) return;
		const id = setInterval(() => {
			setIndex(i => {
				if (i >= words.length - 1) {
					setRunning(false);
					setDone(true);
					return i;
				}
				return i + 1;
			});
		}, 60_000 / wpm);
		return () => clearInterval(id);
	}, [running, wpm, words.length, done]);

	const bringUpControls = useCallback(() => {
		setShowControls(true);
		clearTimeout(hideTimer.current);
		hideTimer.current = setTimeout(() => setShowControls(false), 2800);
	}, []);

	useEffect(() => {
		if (running) bringUpControls();
		else { clearTimeout(hideTimer.current); setShowControls(true); }
		return () => clearTimeout(hideTimer.current);
	}, [running, bringUpControls]);

	const togglePlay = useCallback(() => {
		if (done) { setIndex(0); setDone(false); setRunning(true); return; }
		setRunning(r => !r);
	}, [done]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.code === "Space") { e.preventDefault(); togglePlay(); }
			if (e.code === "ArrowLeft") setIndex(i => Math.max(0, i - 1));
			if (e.code === "ArrowRight") setIndex(i => Math.min((words.length || 1) - 1, i + 1));
			if (e.code === "Escape") router.push("/");
			bringUpControls();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [togglePlay, words.length, router, bringUpControls]);

	const word = words[index] || "";
	const orpIdx = getOrpIndex(word);
	const before = word.slice(0, orpIdx);
	const orp = word[orpIdx] || "";
	const after = word.slice(orpIdx + 1);
	const progress = words.length > 1 ? (index / (words.length - 1)) * 100 : 0;
	const minsLeft = Math.max(0, Math.ceil((words.length - index) / wpm));

	return (
		<div
			className="w-screen h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden"
			onMouseMove={bringUpControls}
			onTouchStart={bringUpControls}
		>
			{/* Vignette */}
			<div
				className="fixed inset-0 pointer-events-none z-10"
				style={{ background: "radial-gradient(ellipse 75% 65% at center, transparent 25%, #09090b 100%)" }}
			/>

			{/* Grain */}
			<div className="grain fixed inset-0 pointer-events-none z-20 opacity-[0.05]" />

			{!done && (
				<>
					{/* ORP guide lines */}
					<div
						className="fixed left-1/2 -translate-x-1/2 w-px h-10 z-30 bg-linear-to-b from-transparent to-amber-400/40"
						style={{ top: "calc(50% - 90px)" }}
					/>
					<div
						className="fixed left-1/2 -translate-x-1/2 w-px h-10 z-30 bg-linear-to-t from-transparent to-amber-400/40"
						style={{ top: "calc(50% + 60px)" }}
					/>

					{/* Hint */}
					<div className={`fixed top-6 left-1/2 -translate-x-1/2 z-30 font-code text-[0.55rem] tracking-[0.25em] uppercase text-zinc-700 whitespace-nowrap transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0"}`}>
						<span className="hidden sm:inline">space · pause &nbsp;·&nbsp; ← → · step &nbsp;·&nbsp; esc · exit</span>
						<span className="sm:hidden">tap screen to pause</span>
					</div>

					{/* Word display — tapping the word area toggles play on mobile */}
					<div
						className="relative z-30 flex items-baseline justify-center font-code text-[clamp(3rem,9vw,6.5rem)] font-bold leading-none select-none drop-shadow-[0_0_60px_rgba(251,191,36,0.15)] px-6 cursor-pointer"
						onClick={togglePlay}
					>
						<span className="text-zinc-100">{before}</span>
						<span className="text-amber-400">{orp}</span>
						<span className="text-zinc-100">{after}</span>
					</div>

					{/* HUD */}
					<div
						className={`fixed bottom-0 left-0 right-0 z-40 px-5 sm:px-8 pb-6 sm:pb-7 flex flex-col gap-2 transition-opacity duration-500 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
						style={{ background: "linear-gradient(to top, #09090b 0%, transparent 100%)" }}
					>
						{/* Progress bar */}
						<div className="w-full h-px bg-zinc-800">
							<div className="h-full bg-amber-400 transition-[width] duration-100" style={{ width: `${progress}%` }} />
						</div>

						{/* Row 1: stats + wpm */}
						<div className="flex items-center justify-between pt-1">
							<div className="flex gap-4 font-code text-[0.6rem] tracking-widest uppercase text-zinc-600">
								<span>{index + 1} / {words.length}</span>
								<span>{minsLeft}m left</span>
							</div>

							<div className="flex items-center gap-1 font-code text-[0.6rem] tracking-wider">
								<button
									className="text-zinc-500 hover:text-amber-400 active:text-amber-400 px-3 py-2 transition-colors"
									onClick={e => { e.stopPropagation(); setWpm(w => Math.max(50, w - 25)); }}
								>−</button>
								<span className="text-amber-400 min-w-[3ch] text-center">{wpm}</span>
								<span className="text-zinc-600">wpm</span>
								<button
									className="text-zinc-500 hover:text-amber-400 active:text-amber-400 px-3 py-2 transition-colors"
									onClick={e => { e.stopPropagation(); setWpm(w => Math.min(1000, w + 25)); }}
								>+</button>
							</div>
						</div>

						{/* Row 2: back + play — full width on mobile */}
						<div className="flex gap-2">
							<button
								className="flex-1 sm:flex-none border border-zinc-700 text-zinc-400 font-code text-[0.55rem] tracking-[0.2em] uppercase px-4 py-3 sm:py-2 hover:border-amber-400/50 hover:text-amber-400 active:border-amber-400/50 active:text-amber-400 transition-all"
								onClick={e => { e.stopPropagation(); router.push("/"); }}
							>← Back</button>
							<button
								className="flex-1 sm:flex-none sm:min-w-20 bg-amber-400 text-zinc-950 font-code text-[0.55rem] font-bold tracking-[0.2em] uppercase px-5 py-3 sm:py-2 hover:bg-amber-300 active:bg-amber-300 transition-colors"
								onClick={e => { e.stopPropagation(); togglePlay(); }}
							>{running ? "Pause" : "Play"}</button>
						</div>
					</div>
				</>
			)}

			{done && (
				<div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center gap-6 px-6 animate-fade-in">
					<div className="font-display text-[clamp(3rem,7vw,5.5rem)] font-light italic text-zinc-100 tracking-tight text-center">
						finished.
					</div>
					<div className="font-code text-[0.6rem] tracking-[0.3em] uppercase text-zinc-500">
						{words.length} words &nbsp;·&nbsp; {wpm} wpm
					</div>
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 w-full max-w-xs sm:max-w-none sm:w-auto">
						<button
							className="w-full sm:w-auto border border-zinc-700 text-zinc-400 font-code text-[0.55rem] tracking-[0.2em] uppercase px-5 py-3.5 sm:py-2.5 hover:border-amber-400/50 hover:text-amber-400 active:border-amber-400/50 active:text-amber-400 transition-all"
							onClick={() => router.push("/")}
						>← New text</button>
						<button
							className="w-full sm:w-auto bg-amber-400 text-zinc-950 font-code text-[0.55rem] font-bold tracking-[0.2em] uppercase px-5 py-3.5 sm:py-2.5 hover:bg-amber-300 active:bg-amber-300 transition-colors"
							onClick={() => { setIndex(0); setDone(false); setRunning(true); }}
						>Read again</button>
					</div>
				</div>
			)}
		</div>
	);
}
