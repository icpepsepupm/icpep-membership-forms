import Image from "next/image"

export function BrandLogo({ size = 56 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative shrink-0 overflow-hidden rounded-xl bg-background ring-1 ring-primary/30"
        style={{ width: size, height: size }}
      >
        <Image
          src="/icpep-logo.jpg"
          alt="PUP ICPEP logo"
          fill
          sizes="56px"
          className="object-cover"
          priority
        />
      </div>
      <div className="leading-tight">
        <p className="font-mono text-sm font-bold tracking-[0.2em] text-foreground">PUP ICPEP</p>
        <p className="text-xs text-muted-foreground">Membership Application</p>
      </div>
    </div>
  )
}
