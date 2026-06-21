import VideoPlayer from "./ui/video-player"

const VideoPlayerDemo = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-8 gap-6">
            <h2 className="text-2xl font-bold text-white mb-4">Video Player Demo</h2>
            <VideoPlayer src="https://videos.pexels.com/video-files/30333849/13003128_2560_1440_25fps.mp4"/>
            <p className="text-zinc-500 text-sm max-w-xl text-center">
                This custom video player features theater-inspired controls, playback speed selection, and smooth motion transitions.
            </p>
        </div>
    )
}

export { VideoPlayerDemo }
