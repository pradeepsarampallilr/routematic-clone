import sys
import json
from ortools.constraint_solver import routing_enums_pb2, pywrapcp

def solve_routing():
    try:
        # 1. Read JSON payload passed from Express via stdin
        raw_input = sys.stdin.read()
        if not raw_input:
            print(json.dumps({"error": "Empty input received"}))
            sys.exit(1)

        data = json.loads(raw_input)
        
        matrix = data["matrix"]                        # NxN travel time matrix in seconds
        capacity = data.get("capacity", 4)              # Max passengers per cab
        num_vehicles = data.get("num_vehicles", 3)      # Max available cabs
        depot = data.get("depot", 0)                    # Index 0 is Office Hub

        num_locations = len(matrix)

        # 2. Initialize Routing Index Manager & Model
        manager = pywrapcp.RoutingIndexManager(num_locations, num_vehicles, depot)
        routing = pywrapcp.RoutingModel(manager)

        # 3. Define Cost Evaluator (Travel Time Matrix)
        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return int(matrix[from_node][to_node])

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # 4. Define Capacity Constraint (1 passenger per pickup stop)
        def demand_callback(from_index):
            node = manager.IndexToNode(from_index)
            return 0 if node == depot else 1  # Office needs 0 capacity, pickups need 1

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,                         # Null capacity slack
            [capacity] * num_vehicles, # Vehicle capacity vector
            True,                      # Start cumulative count at zero
            "Capacity"
        )

        # 5. Configure Solver Search Parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        # Limit solver time to 2 seconds for quick prototype responses
        search_parameters.time_limit.seconds = 2

        # 6. Run Optimization Solver
        solution = routing.SolveWithParameters(search_parameters)

        # 7. Extract & Format Output Routes
        routes = []
        if solution:
            for vehicle_id in range(num_vehicles):
                index = routing.Start(vehicle_id)
                route = []
                while not routing.IsEnd(index):
                    node = manager.IndexToNode(index)
                    route.append(node)
                    index = solution.Value(routing.NextVar(index))
                
                # Include final return stop to office if vehicle was used
                if len(route) > 1:
                    route.append(manager.IndexToNode(index))
                    routes.append(route)

        # Return JSON result via stdout
        print(json.dumps({"success": True, "routes": routes}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    solve_routing()