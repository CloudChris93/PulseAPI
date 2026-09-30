   export default function Logo({ size = 22 }) {
     return (
       <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
         <svg width={size} height={size} viewBox="0 0 32 32">
           <rect width="32" height="32" rx="7" fill="#4F46E5" />
           <path
             d="M6 18 L11 18 L14 11 L18 23 L21 14 L23 18 L26 18"
             fill="none"
             stroke="white"
             strokeWidth="2.2"
             strokeLinecap="round"
             strokeLinejoin="round"
           />
         </svg>
         <strong style={{ fontSize: size < 20 ? 15 : 18 }}>PulseAPI</strong>
       </span>
     );
   }