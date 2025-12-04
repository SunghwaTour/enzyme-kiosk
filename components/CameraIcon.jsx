export function CameraIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 64} // 기본 크기 64px, props로 조절 가능
      height={props.size || 64}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor" // 부모 요소의 글자색을 따라감
      strokeWidth="1.5" // 선 두께 살짝 얇게 (세련된 느낌)
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props} // 나머지 props 전달 (className 등)
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}