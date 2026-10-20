import { Button } from "./Button";
import { Spinner } from "./spinner";

export const LoadMore = ({
  hasMore,
  isLoading,
  onClick,
}: {
  hasMore: boolean;
  isLoading: boolean;
  onClick: () => void;
}) => {
  if (!hasMore) return null;
  return (
    <div className="w-full flex justify-center">
      <Button
        type="button"
        variant="secondary"
        disabled={isLoading}
        onClick={onClick}
      >
        Load more
        {isLoading && <Spinner />}
      </Button>
    </div>
  );
};
