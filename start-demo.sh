#!/usr/bin/env bash

# Startup script for the Items Store Manager Demo
# This script helps start both the REST API server and the demo application

set -e  # Exit on any error

echo "🚀 Items Store Manager - Demo Startup Script"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_PORT=3000
DEMO_PORT=8080
API_PID_FILE=".api.pid"
DEMO_PID_FILE=".demo.pid"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to get PID using a port
get_pid_by_port() {
    local port=$1
    lsof -ti:$port 2>/dev/null || echo ""
}

# Function to stop servers
stop_servers() {
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    
    # Stop API server
    if [ -f "$API_PID_FILE" ]; then
        local api_pid=$(cat "$API_PID_FILE")
        if kill -0 "$api_pid" 2>/dev/null; then
            kill "$api_pid" 2>/dev/null || true
            echo "   ✅ Stopped API server (PID: $api_pid)"
        fi
        rm -f "$API_PID_FILE"
    fi
    
    # Stop demo server
    if [ -f "$DEMO_PID_FILE" ]; then
        local demo_pid=$(cat "$DEMO_PID_FILE")
        if kill -0 "$demo_pid" 2>/dev/null; then
            kill "$demo_pid" 2>/dev/null || true
            echo "   ✅ Stopped demo server (PID: $demo_pid)"
        fi
        rm -f "$DEMO_PID_FILE"
    fi
    
    # Kill any remaining processes on our ports
    local api_pid=$(get_pid_by_port $API_PORT)
    local demo_pid=$(get_pid_by_port $DEMO_PORT)
    
    if [ ! -z "$api_pid" ]; then
        kill "$api_pid" 2>/dev/null || true
        echo "   ✅ Killed process on port $API_PORT (PID: $api_pid)"
    fi
    
    if [ ! -z "$demo_pid" ]; then
        kill "$demo_pid" 2>/dev/null || true
        echo "   ✅ Killed process on port $DEMO_PORT (PID: $demo_pid)"
    fi
}

# Function to start API server
start_api_server() {
    echo -e "${BLUE}📡 Starting REST API server...${NC}"
    
    if check_port $API_PORT; then
        local existing_pid=$(get_pid_by_port $API_PORT)
        echo -e "   ${YELLOW}⚠️  Port $API_PORT is already in use (PID: $existing_pid)${NC}"
        echo -e "   ${YELLOW}   Using existing API server${NC}"
        return 0
    fi
    
    # Start API server in background
    node server.js &
    local api_pid=$!
    echo "$api_pid" > "$API_PID_FILE"
    
    # Wait a moment for server to start
    sleep 2
    
    # Check if server started successfully
    if kill -0 "$api_pid" 2>/dev/null && check_port $API_PORT; then
        echo -e "   ✅ API server started successfully (PID: $api_pid)"
        echo -e "   🌐 API URL: http://localhost:$API_PORT"
        return 0
    else
        echo -e "   ${RED}❌ Failed to start API server${NC}"
        rm -f "$API_PID_FILE"
        return 1
    fi
}

# Function to start demo server
start_demo_server() {
    echo -e "${BLUE}🏪 Starting demo application server...${NC}"
    
    if check_port $DEMO_PORT; then
        local existing_pid=$(get_pid_by_port $DEMO_PORT)
        echo -e "   ${YELLOW}⚠️  Port $DEMO_PORT is already in use (PID: $existing_pid)${NC}"
        echo -e "   ${YELLOW}   Using existing demo server${NC}"
        return 0
    fi
    
    # Start demo server in background
    node index.js &
    local demo_pid=$!
    echo "$demo_pid" > "$DEMO_PID_FILE"
    
    # Wait a moment for server to start
    sleep 2
    
    # Check if server started successfully
    if kill -0 "$demo_pid" 2>/dev/null && check_port $DEMO_PORT; then
        echo -e "   ✅ Demo server started successfully (PID: $demo_pid)"
        echo -e "   🌐 Demo URL: http://localhost:$DEMO_PORT"
        return 0
    else
        echo -e "   ${RED}❌ Failed to start demo server${NC}"
        rm -f "$DEMO_PID_FILE"
        return 1
    fi
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Server Status:${NC}"
    
    # Check API server
    if check_port $API_PORT; then
        local api_pid=$(get_pid_by_port $API_PORT)
        echo -e "   📡 REST API Server: ${GREEN}✅ Running${NC} (PID: $api_pid, Port: $API_PORT)"
    else
        echo -e "   📡 REST API Server: ${RED}❌ Not running${NC} (Port: $API_PORT)"
    fi
    
    # Check demo server
    if check_port $DEMO_PORT; then
        local demo_pid=$(get_pid_by_port $DEMO_PORT)
        echo -e "   🏪 Demo Server: ${GREEN}✅ Running${NC} (PID: $demo_pid, Port: $DEMO_PORT)"
    else
        echo -e "   🏪 Demo Server: ${RED}❌ Not running${NC} (Port: $DEMO_PORT)"
    fi
    
    echo ""
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start both API and demo servers"
    echo "  stop      Stop both servers"
    echo "  restart   Restart both servers"
    echo "  status    Show server status"
    echo "  api       Start only the API server"
    echo "  demo      Start only the demo server"
    echo "  test      Run API tests"
    echo "  open      Open demo in browser"
    echo "  logs      Show server logs (if available)"
    echo "  help      Show this help message"
    echo ""
    echo "URLs:"
    echo "  Demo Application:  http://localhost:$DEMO_PORT"
    echo "  REST API:          http://localhost:$API_PORT"
    echo "  API Documentation: http://localhost:$API_PORT (HTML view)"
    echo ""
}

# Main command handling
case "${1:-start}" in
    "start")
        echo -e "${GREEN}🚀 Starting Items Store Manager Demo...${NC}"
        echo ""
        
        # Start API server first
        if start_api_server; then
            # Start demo server
            if start_demo_server; then
                echo ""
                echo -e "${GREEN}✅ All servers started successfully!${NC}"
                echo ""
                show_status
                echo -e "${BLUE}🌐 Open your browser and visit:${NC}"
                echo -e "   👉 ${YELLOW}http://localhost:$DEMO_PORT${NC}"
                echo ""
                echo -e "${BLUE}💡 Useful commands:${NC}"
                echo "   📊 Check status:    $0 status"
                echo "   🛑 Stop servers:    $0 stop"
                echo "   🔄 Restart:         $0 restart"
                echo "   🧪 Run tests:       $0 test"
                echo ""
                echo "Press Ctrl+C to stop all servers"
                
                # Keep script running and handle Ctrl+C
                trap 'echo ""; stop_servers; exit 0' INT
                
                # Keep checking if servers are still running
                while true; do
                    sleep 5
                    if [ -f "$API_PID_FILE" ]; then
                        local api_pid=$(cat "$API_PID_FILE")
                        if ! kill -0 "$api_pid" 2>/dev/null; then
                            echo -e "${RED}❌ API server stopped unexpectedly${NC}"
                            break
                        fi
                    fi
                    if [ -f "$DEMO_PID_FILE" ]; then
                        local demo_pid=$(cat "$DEMO_PID_FILE")
                        if ! kill -0 "$demo_pid" 2>/dev/null; then
                            echo -e "${RED}❌ Demo server stopped unexpectedly${NC}"
                            break
                        fi
                    fi
                done
            else
                echo -e "${RED}❌ Failed to start demo server${NC}"
                stop_servers
                exit 1
            fi
        else
            echo -e "${RED}❌ Failed to start API server${NC}"
            exit 1
        fi
        ;;
        
    "stop")
        stop_servers
        echo -e "${GREEN}✅ All servers stopped${NC}"
        ;;
        
    "restart")
        echo -e "${YELLOW}🔄 Restarting servers...${NC}"
        stop_servers
        sleep 2
        exec "$0" start
        ;;
        
    "status")
        show_status
        ;;
        
    "api")
        start_api_server
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ API server is running${NC}"
            echo -e "   🌐 API URL: http://localhost:$API_PORT"
            echo ""
            echo "Press Ctrl+C to stop"
            trap 'stop_servers; exit 0' INT
            wait
        fi
        ;;
        
    "demo")
        start_demo_server
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Demo server is running${NC}"
            echo -e "   🌐 Demo URL: http://localhost:$DEMO_PORT"
            echo ""
            echo "Press Ctrl+C to stop"
            trap 'stop_servers; exit 0' INT
            wait
        fi
        ;;
        
    "test")
        echo -e "${BLUE}🧪 Running API tests...${NC}"
        if check_port $API_PORT; then
            node test-endpoints.js
        else
            echo -e "${RED}❌ API server is not running. Start it first with: $0 api${NC}"
            exit 1
        fi
        ;;
        
    "open")
        if check_port $DEMO_PORT; then
            echo -e "${BLUE}🌐 Opening demo in browser...${NC}"
            if command -v open >/dev/null 2>&1; then
                open "http://localhost:$DEMO_PORT"
            elif command -v xdg-open >/dev/null 2>&1; then
                xdg-open "http://localhost:$DEMO_PORT"
            else
                echo -e "${YELLOW}⚠️  Could not detect browser. Please open manually:${NC}"
                echo "   http://localhost:$DEMO_PORT"
            fi
        else
            echo -e "${RED}❌ Demo server is not running. Start it first with: $0 start${NC}"
            exit 1
        fi
        ;;
        
    "logs")
        echo -e "${BLUE}📋 Server logs:${NC}"
        echo "   (Logs are displayed in the terminal where servers were started)"
        echo "   To see live logs, start servers individually:"
        echo "   - API server:  node server.js"
        echo "   - Demo server: node index.js"
        ;;
        
    "help"|"-h"|"--help")
        show_help
        ;;
        
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac