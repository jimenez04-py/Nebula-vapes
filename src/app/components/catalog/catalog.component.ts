import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('starCanvas', { static: true }) starCanvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D | null;
  private stars: {
    x: number;
    y: number;
    size: number;
    baseAlpha: number;
    twPhase: number;
    depth: number;
  }[] = [];
  private raf = 0;
  private mouseX = 0;
  private mouseY = 0;
  private pixelRatio = 1;

  mostrarModal = false;

  modalAbierto: boolean = false;

  // Nuevo: lista de productos con imagenes y sabores por producto
  products = [
    {
      id: 'WAKA',
      name: 'WAKA',
      price: '$350',
      image: 'https://nimbusmx.com/cdn/shop/files/Waka15k.webp?v=1730955334',
      flavors: [
        'FRESH MINT (sold out)',
        'KIWI DRAGON BERRY',
        'WATERMELON KIWI',
        'PEACH BLUE RASPBERRY',
        'PEACH MANGO WATERMELON',
        'STRAWBERRY WATERMELON',
        'STRAWBERRY BURST'
      ]
    },
    {
      id: 'FASTA',
      name: 'FASTA',
      price: '$350',
      image: 'https://mipod.com/cdn/shop/files/Fasta-Burrst_Sour-Blue-Razz_A2_600x600_3edf7f2b-65df-4f3a-8a4d-a59a0b521ce8.png?v=1736283680&width=600',
      flavors: [
        'FUCKING FAB SODA',
	      'FROZEN SOUR APPLE',
        'JUICY PEACH SODA',
      	'GRAPE SODA',
        'FROZEN WHITE GRAPE',
	      'PEACH MANGO WATERMELON (sold out)',
  	    '2 FROZEN WATERMELON'
      ]
    },
    {
      id: 'RODMAN',
      name: 'RODMAN',
      price: '$250',
      image: 'https://lavaperia.com/cdn/shop/files/pineapplebananaice1000px.webp?v=1759789448&width=510',
      flavors: [
        'ALLSTAR',
        '2 COOL MINT',
        'RODZILLA',
        'THE WORM',
        'RODMAN BLAST',
        'THE MENACE',
        'HALL OF FAME'
      ]
    },
    {
      id: 'ELUX',
      name: 'ELUX',
      price: '$350',
      image: 'https://vapematemx.com/cdn/shop/files/elux18000tesla.png?v=1740182401',
      flavors: [
        'LOST CHERRY',
        'STRAWLANDS',
        'STRAWBERRY WATERMELON',
        'BLUEBERRY WATERMELON',
        'BLUE RAZZ ICE'
      ]
    }
  ];

  productoSeleccionadoData: {
    id: string;
    name: string;
    price?: string;
    image?: string;
    flavors: string[];
  } | null = null;

  // Marca los sabores especiales para RODMAN
  private rodmanSpecials = new Set([
    'RODZILLA',
    'THE WORM',
    'RODMAN BLAST',
    'THE MENACE'
  ]);

  private soldOutMap = new Map<string, Set<string>>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Record<string, string[]>>('assets/sold-out.json', { headers: { 'cache-control': 'no-cache' } })
      .subscribe({
        next: (data) => {
          Object.entries(data || {}).forEach(([pid, flavors]) => {
            this.soldOutMap.set(pid.toUpperCase(), new Set((flavors || []).map(f => f.toUpperCase().trim())));
          });
        },
        error: () => {
          // si falla, deja vacío
          this.soldOutMap.clear();
        }
      });
  }

  abrirModal(productId: string) {
    this.productoSeleccionadoData = this.products.find(p => p.id === productId) || null;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.productoSeleccionadoData = null;
  }

  isSpecial(productId: string, flavor: string): boolean {
    if (!productId || !flavor) return false;
    if (productId.toUpperCase() !== 'RODMAN') return false;
    return this.rodmanSpecials.has(flavor.toUpperCase().trim());
  }

  isFlavorSoldOut(productId: string, flavor: string): boolean {
    const set = this.soldOutMap.get((productId || '').toUpperCase());
    return !!set && set.has((flavor || '').toUpperCase().trim());
  }

  isFlavorTextSoldOut(flavor: string): boolean {
    return /\(sold out\)/i.test(flavor);
  }

  cleanFlavorText(flavor: string): string {
    return flavor.replace(/\(sold out\)/ig, '').trim();
  }

  ngAfterViewInit() {
    // Animación inicial
    gsap.to('.vape', {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power3.out'
    });

    // Movimiento con scroll
    gsap.to('.vape', {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      y: 270,
      scale: 1.2,
      ease: 'power1.out'
    });

    // inicializar canvas de estrellas
    this.initStarfield();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResizeBound);
    window.removeEventListener('mousemove', this.onMouseMoveBound);
  }

  // Bindings para remover listeners correctamente
  private onResizeBound = this.onResize.bind(this);
  private onMouseMoveBound = this.onMouseMove.bind(this);

  private initStarfield() {
    const canvas = this.starCanvas.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.pixelRatio = window.devicePixelRatio || 1;
    window.addEventListener('resize', this.onResizeBound);
    window.addEventListener('mousemove', this.onMouseMoveBound);
    this.onResize();
    this.createStars();
    this.raf = requestAnimationFrame(this.render.bind(this));
  }

  private onResize() {
    const canvas = this.starCanvas.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * this.pixelRatio);
    canvas.height = Math.round(h * this.pixelRatio);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    if (this.ctx) this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    // recrear estrellas para densidad apropiada
    this.createStars();
  }

  private onMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  private createStars() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const area = w * h;
    // cantidad escalada según área (ajusta factor si quieres más/menos)
    const count = Math.round(Math.min(900, Math.max(80, area / 8000)));
    this.stars = [];
    for (let i = 0; i < count; i++) {
      const depth = Math.random(); // 0 (cerca) - 1 (lejos)
      const size = 0.4 + Math.pow(Math.random(), 2) * 2.6 * (1 - depth); // más pequeños en profundidad
      const star = {
        x: Math.random() * w,
        y: Math.random() * h,
        size,
        baseAlpha: 0.25 + Math.random() * 0.85 * (1 - depth),
        twPhase: Math.random() * Math.PI * 2,
        depth
      };
      this.stars.push(star);
    }
  }

  private render(t: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    // centro para calcular parallax
    const cx = w / 2;
    const cy = h / 2;
    const mx = (this.mouseX - cx) / cx;
    const my = (this.mouseY - cy) / cy;

    // dibujar estrellas dispersas, con ligera variación posicional para evitar patrón
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];

      // parallax: las estrellas más cercanas se mueven más con el cursor
      const px = s.x + mx * 30 * (1 - s.depth);
      const py = s.y + my * 20 * (1 - s.depth);

      // ligero desplazamiento aleatorio temporal para romper la rejilla
      const jitterX = Math.sin((t * 0.0008) + i) * (0.5 + s.depth * 0.8);
      const jitterY = Math.cos((t * 0.0007) + i * 1.3) * (0.5 + s.depth * 0.5);

      // parpadeo suave
      const twinkle = 0.6 + Math.sin((t * 0.002) + s.twPhase) * 0.4;
      const alpha = Math.max(0, Math.min(1, s.baseAlpha * twinkle));

      // dibujar punto con gradiente circular para apariencia suave
      const radius = Math.max(0.2, s.size);
      const gx = px + jitterX;
      const gy = py + jitterY;

      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius * 3);
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(0.4, `rgba(255,255,255,${alpha * 0.6})`);
      grad.addColorStop(1, `rgba(255,255,255,0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy, radius * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // loop
    this.raf = requestAnimationFrame(this.render.bind(this));
  }
}

