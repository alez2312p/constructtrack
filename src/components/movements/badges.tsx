import { MovementData } from "@/lib/type";
import { Badge } from "../ui/badge";

const Badges = ({ movement }: { movement: MovementData }) => (
    <div className="flex flex-wrap gap-1.5 mt-1">
        {movement.material.category && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                {movement.material.category.name}
            </Badge>
        )}
        {movement.material.location && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                {movement.material.location.name}
            </Badge>
        )}
    </div>
);

export default Badges