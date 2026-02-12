interface SlideCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function SlideCard({ title, description, icon }: SlideCardProps) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 text-center">
      <div className="text-primary mb-6 text-6xl">{icon}</div>
      <h2 className="text-xl font-semibold text-text-primary mb-3">{title}</h2>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  );
}
