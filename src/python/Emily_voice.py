import asyncio
import edge_tts
import sys
import os

async def emilyai(text, output_path="Emily_audio.mp3"):
    if not text.strip():
        print("ERROR: Empty input", file=sys.stderr)
        return

    communicate = edge_tts.Communicate(
        text=text,
        voice="en-IE-EmilyNeural",
        rate="+4%",
        pitch="+15Hz"
    )

    await communicate.save(output_path)

    if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
        print(output_path)  # Send to Node.js
    else:
        print("ERROR: File not created or empty", file=sys.stderr)

if __name__ == "__main__":
    text = " ".join(sys.argv[1:])
    asyncio.run(emilyai(text))
