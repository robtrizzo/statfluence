import { cn } from "@/lib/utils";
export function TypographyH1({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "font-sans scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-4",
        className
      )}
    >
      {children}
    </h1>
  );
}
export function TypographyH2({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "font-sans scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-4",
        className
      )}
    >
      {children}
    </h2>
  );
}
export function TypographyH3({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h3
      id={id}
      className={cn(
        "font-sans scroll-m-20 text-2xl font-semibold tracking-tight mt-4",
        className
      )}
    >
      {children}
    </h3>
  );
}
export function TypographyH4({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h4
      id={id}
      className={cn(
        "font-sans scroll-m-20 text-xl font-semibold tracking-tight mt-4",
        className
      )}
    >
      {children}
    </h4>
  );
}
export function TypographyP({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <p id={id} className={cn("font-serif leading-7 not-first:mt-2", className)}>
      {children}
    </p>
  );
}
export function TypographyBlockquote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <blockquote
      className={cn("my-4 border-l-2 pl-6 font-serif italic", className)}
    >
      {children}
    </blockquote>
  );
}
export function TypographyInlineCode({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {children}
    </code>
  );
}

export function TypographyUnorderedList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ul className={cn("mb-4 ml-6 list-disc [&>li]:mt-2 font-serif", className)}>
      {children}
    </ul>
  );
}

export function TypographyOrderedList({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ol className="mb-4 ml-6 list-decimal [&>li]:mt-2 font-serif">
      {children}
    </ol>
  );
}
