export default function VideoPlayer({ movie }) {
  return <video controls poster={movie.posterUrl} src={movie.videoUrl} />
}
