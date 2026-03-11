"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
	const [text, setText] = useState("");
	const [wpm, setWpm] = useState(300);
	const router = useRouter();

	const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
	const readTime = wordCount > 0 ? (wordCount / wpm).toFixed(1) : "0";

	const handleSpreed = () => {
		if (!text.trim()) return;
		sessionStorage.setItem("spreed-text", text);
		sessionStorage.setItem("spreed-wpm", String(wpm));
		router.push("/read");
	};

	return (
		<div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 py-16 relative">
			{/* Grain overlay */}
			<div className="grain fixed inset-0 pointer-events-none z-50 opacity-[0.04]" />

			<div className="w-full max-w-lg flex flex-col gap-8 sm:gap-10 relative z-10">

				{/* Brand */}
				<div>
					<h1 className="font-display text-[3.5rem] sm:text-[5.5rem] font-light tracking-tight text-zinc-100 leading-none">
						spr<em className="italic text-amber-400">ee</em>der
					</h1>
					<p className="text-[0.6rem] tracking-[0.3em] uppercase text-zinc-500 mt-2">
						Rapid serial visual presentation
					</p>
				</div>

				{/* Divider */}
				<div className="h-px bg-gradient-to-r from-amber-400/40 to-transparent" />

				{/* Text area */}
				<div className="flex flex-col gap-2">
					<label className="text-[0.6rem] tracking-[0.25em] uppercase text-zinc-500">
						Your text
					</label>
					<div className="border border-zinc-800 focus-within:border-amber-400/40 transition-colors duration-300">
						<textarea
							className="w-full h-52 bg-zinc-900 text-zinc-100 font-code text-sm leading-relaxed p-5 outline-none resize-none placeholder-zinc-700 caret-amber-400"
							value={text}
							onChange={e => setText(e.target.value)}
							placeholder="paste or type what you want to read..."
						/>
					</div>
					<div className="flex justify-between text-[0.6rem] tracking-widest text-zinc-600">
						<span>{wordCount} words</span>
						<span>{readTime} min at {wpm} wpm</span>
					</div>
				</div>

				{/* Controls */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
					<div className="flex-1 flex flex-col gap-3">
						<div className="flex justify-between items-baseline">
							<span className="text-[0.6rem] tracking-[0.25em] uppercase text-zinc-500">Speed</span>
							<span className="font-display text-5xl font-semibold text-amber-400 leading-none">{wpm}</span>
						</div>
						<input
							type="range"
							min={50}
							max={1000}
							step={25}
							value={wpm}
							onChange={e => setWpm(Number(e.target.value))}
						/>
					</div>

					<button
						className="w-full sm:w-auto bg-amber-400 text-zinc-950 font-code text-[0.65rem] font-bold tracking-[0.2em] uppercase px-7 py-4 sm:py-3.5 flex-shrink-0 transition-all duration-200 hover:bg-amber-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(251,191,36,0.35)] active:translate-y-0 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
						onClick={handleSpreed}
						disabled={!text.trim()}
					>
						Spreed →
					</button>
				</div>
			</div>
		</div>
	);
}
